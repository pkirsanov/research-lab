/*
 * tests/rlattention.test.mjs
 * ------------------------------------------------------------------------
 * Feature 017 Scope 01 — Decision Attention capability module (rlattention.js)
 * CONTRACT suite (SCN-017-001 .. SCN-017-024, plus SCN-017-046).
 *
 * Drives the REAL rlattention.js UMD module over INLINE OBSERVATIONS
 * (low-noise-gate results, authored fields, a trading calendar, a watchlist
 * scope) and proves — against the PRODUCTION transform, never a fixture echo:
 *   - the sixteen-member frozen export surface and the contract version;
 *   - that the certified nine lifecycle states / certified transition edges are
 *     preserved verbatim and that the two NEW states are append-only terminals;
 *   - every closed refusal code, each proven by an adversarial mutation of the
 *     observations that flips ok:true -> ok:false;
 *   - deterministic total-order ranking (no clock, no randomness) and the
 *     reader-language rank rationale;
 *   - the attention cap as a ceiling and the explicit empty state;
 *   - append-only lifecycle transitions, supersession back-references and the
 *     outcome / interruption-rate derivations.
 *
 * Fixtures supply OBSERVATIONS ONLY. No fixture carries a pre-computed verdict,
 * rank, boundary timestamp or refusal code; production derives all of them.
 * No mocking of internal logic. No network. No DOM.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODULE_PATH = resolve(ROOT, 'rlattention.js');

/* Load the production module fresh (so the load-time drift assertion in
   SCN-017-002 can be driven against a deficient upstream stub). */
function load() {
  delete require.cache[MODULE_PATH];
  return require(MODULE_PATH);
}

/* ── the external certified contract this module MUST NOT redefine ───────── */

const CERTIFIED_STATES = [
  'discovered', 'evidence-building', 'qualified', 'rejected',
  'acknowledged', 'monitoring', 'invalidated', 'resolved', 'stale'
];

const CERTIFIED_TRANSITIONS = {
  'discovered': ['evidence-building', 'rejected'],
  'evidence-building': ['qualified', 'rejected'],
  'qualified': ['acknowledged', 'stale'],
  'acknowledged': ['monitoring', 'stale'],
  'monitoring': ['invalidated', 'resolved', 'stale'],
  'rejected': [],
  'invalidated': [],
  'resolved': [],
  'stale': []
};

const NEW_STATES = ['escalated', 'superseded'];

const TRANSMISSION_CHANNELS = [
  'rates-liquidity', 'fx-carry', 'credit-funding', 'volatility-options',
  'commodities-energy', 'breadth-market-structure',
  'geopolitical-supply-chain', 'counterparty-operational'
];

const RESEARCH_VERBS = [
  'monitor', 'verify', 'investigate', 'scenario-test',
  'review-hedge-research', 'trace-claims'
];

const EXPECTED_MEMBERS = [
  'CONTRACT_VERSION',
  'ATTENTION_LIFECYCLE_STATES',
  'ATTENTION_LIFECYCLE_TRANSITIONS',
  'DECISION_WINDOWS',
  'TERMINAL_OUTCOME_CLASSES',
  'REFUSAL_CODES',
  'resolveDecisionWindow',
  'buildAttentionItem',
  'validateAttentionItem',
  'rankAttentionItems',
  'selectAttentionItems',
  'rankRationale',
  'applyAttentionLifecycleEvent',
  'deriveOutcomeRecord',
  'computeInterruptionRate',
  'toViewModel'
];

/* ── inline OBSERVATIONS ─────────────────────────────────────────────────── */

const TRADING_DATE = '2026-07-24';

/* an observed exchange calendar: sessions with real open/close instants. The
   module resolves boundaries FROM this; the test never precomputes them. */
const CALENDAR = Object.freeze({
  timezone: 'America/New_York',
  sessions: Object.freeze([
    Object.freeze({ tradingDate: '2026-07-24', opensUtc: '2026-07-24T13:30:00.000Z', closesUtc: '2026-07-24T20:00:00.000Z' }),
    Object.freeze({ tradingDate: '2026-07-27', opensUtc: '2026-07-27T13:30:00.000Z', closesUtc: '2026-07-27T20:00:00.000Z' }),
    Object.freeze({ tradingDate: '2026-07-28', opensUtc: '2026-07-28T13:30:00.000Z', closesUtc: '2026-07-28T20:00:00.000Z' })
  ])
});

/* observed window vocabulary: anchor + offset only, no resolved instants. */
const WINDOW_VOCABULARY = Object.freeze({
  'pre-market': Object.freeze({ anchor: 'open', offsetMinutes: -90 }),
  'morning': Object.freeze({ anchor: 'open', offsetMinutes: 30 }),
  'pre-close': Object.freeze({ anchor: 'close', offsetMinutes: -30 }),
  'after-hours': Object.freeze({ anchor: 'close', offsetMinutes: 60 })
});

const WATCHLIST = Object.freeze(['SPY', 'TLT', 'HYG', 'EURUSD']);

/* FR-018 allowlist: the registry-derived tool pages an item may link to. */
const TOOL_DEEP_LINKS = Object.freeze([
  'market-heatmap-lab.html',
  'sector-research-lab.html',
  'bond-regime-lab.html'
]);

function ctx(overrides) {
  return Object.assign({
    tradingDateIso: TRADING_DATE,
    calendarSource: CALENDAR,
    windowVocabulary: WINDOW_VOCABULARY,
    watchlistScope: WATCHLIST,
    toolDeepLinks: TOOL_DEEP_LINKS,
    publishedActionSubjects: []
  }, overrides || {});
}

/* a low-noise-gate result: OBSERVED disposition + evidence, no verdict. */
function gateResult(overrides) {
  return Object.assign({
    gateId: 'low-noise-gate',
    subject: 'HYG',
    deepLink: 'market-heatmap-lab.html',
    disposition: 'attention',
    severity: 'moderate',
    imminence: 'imminent',
    transmissionPath: ['credit-funding'],
    transmissionAbsenceNote: null,
    marketConfirmation: { state: 'present', detail: 'HYG-IEF spread widened 18bp over five sessions.' },
    marketConfirmationNote: null,
    figures: [
      { label: 'HYG-IEF spread change', value: '+18bp', provenance: { sourceId: 'market-heatmap-lab', asOf: '2026-07-24T20:00:00.000Z' } }
    ],
    observedAt: '2026-07-24T12:00:00.000Z'
  }, overrides || {});
}

/* authored, human-owned fields: headline / falsifiability / disposition verb. */
function authored(overrides) {
  return Object.assign({
    headline: 'High-yield credit spreads widened for a fifth straight session',
    invalidation: 'HYG-IEF spread retraces below 8bp of its five-session start.',
    escalationTrigger: 'HYG-IEF spread widens beyond 35bp intraday.',
    expiry: '2026-07-31T20:00:00.000Z',
    verb: 'monitor',
    rationale: 'Credit funding stress is broadening beyond a single issuer.',
    decisionWindow: 'pre-close',
    horizon: 'this-week'
  }, overrides || {});
}

function built(gateOverrides, authoredOverrides, ctxOverrides) {
  const RL = load();
  return RL.buildAttentionItem(gateResult(gateOverrides), authored(authoredOverrides), ctx(ctxOverrides));
}

function mustBuild(gateOverrides, authoredOverrides, ctxOverrides) {
  const r = built(gateOverrides, authoredOverrides, ctxOverrides);
  assert.equal(r.ok, true, 'expected buildAttentionItem to accept the fixture, got: ' + JSON.stringify(r));
  return r.item;
}

/* deterministic shuffle — the test itself must not introduce randomness. */
function lcg(seed) {
  let s = seed >>> 0;
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function shuffle(arr, rnd) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

function codesOf(result) {
  if (result.ok === false) return [result.code];
  return (result.violations || []).map(function (v) { return v.code; });
}

/* ═══════════════════════════ SCN-017-001 ═══════════════════════════════ */

test('SCN-017-001 The attention module loads in Node with sixteen frozen members', () => {
  const RL = load();

  assert.deepEqual(Object.keys(RL).sort(), EXPECTED_MEMBERS.slice().sort(),
    'export surface must be exactly the sixteen contracted members');

  assert.equal(RL.CONTRACT_VERSION, 'decision-attention/v1');

  for (const name of ['ATTENTION_LIFECYCLE_STATES', 'ATTENTION_LIFECYCLE_TRANSITIONS',
    'DECISION_WINDOWS', 'TERMINAL_OUTCOME_CLASSES', 'REFUSAL_CODES']) {
    assert.equal(Object.isFrozen(RL[name]), true, name + ' must be frozen');
  }
  for (const name of ['resolveDecisionWindow', 'buildAttentionItem', 'validateAttentionItem',
    'rankAttentionItems', 'selectAttentionItems', 'rankRationale',
    'applyAttentionLifecycleEvent', 'deriveOutcomeRecord', 'computeInterruptionRate',
    'toViewModel']) {
    assert.equal(typeof RL[name], 'function', name + ' must be a function');
  }

  assert.equal(RL.ATTENTION_LIFECYCLE_STATES.length, 11);
  assert.deepEqual(RL.DECISION_WINDOWS.slice().sort(),
    ['after-hours', 'morning', 'pre-close', 'pre-market']);
  assert.deepEqual(RL.TERMINAL_OUTCOME_CLASSES.slice(),
    ['escalated', 'confirmed', 'resolved', 'expired-without-effect']);
  assert.equal(Object.isFrozen(RL.TERMINAL_OUTCOME_CLASSES), true);

  for (const code of RL.REFUSAL_CODES) {
    assert.match(code, /^RLATTN-[A-Z-]+$/, 'refusal codes are RLATTN-* : ' + code);
  }
});

/* ═══════════════════════════ SCN-017-002 ═══════════════════════════════ */

test('SCN-017-002 A missing certified lifecycle state refuses at load time', () => {
  const MISSING = 'monitoring';
  const deficient = CERTIFIED_STATES.filter((s) => s !== MISSING);
  const savedGlobal = globalThis.RLMARKETACTION;
  const savedEnv = process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES;

  try {
    /* simulate upstream drift: the certified vocabulary has lost one state. */
    globalThis.RLMARKETACTION = { LIFECYCLE_STATES: deficient };
    process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES = deficient.join(',');

    let refusal = null;
    try {
      load();
    } catch (err) {
      refusal = err;
    }

    assert.notEqual(refusal, null,
      'a deficient upstream lifecycle vocabulary must refuse at load time, not load silently');
    const text = String((refusal && refusal.message) || refusal);
    assert.match(text, /RLATTN-LIFECYCLE-DRIFT/, 'drift refusal must name RLATTN-LIFECYCLE-DRIFT');
    assert.match(text, new RegExp(MISSING), 'drift refusal must name the missing state');
  } finally {
    if (savedGlobal === undefined) delete globalThis.RLMARKETACTION;
    else globalThis.RLMARKETACTION = savedGlobal;
    if (savedEnv === undefined) delete process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES;
    else process.env.RLATTN_UPSTREAM_LIFECYCLE_STATES = savedEnv;
    delete require.cache[MODULE_PATH];
  }

  /* and with the full certified vocabulary present the module loads clean. */
  const RL = load();
  for (const s of CERTIFIED_STATES) {
    assert.equal(RL.ATTENTION_LIFECYCLE_STATES.includes(s), true, 'must retain certified state ' + s);
  }
});

/* ═══════════════════════════ SCN-017-003 ═══════════════════════════════ */

test('SCN-017-003 Certified transitions are preserved and only new edges are appended', () => {
  const RL = load();
  const T = RL.ATTENTION_LIFECYCLE_TRANSITIONS;

  assert.equal(Object.isFrozen(T), true);

  for (const state of Object.keys(CERTIFIED_TRANSITIONS)) {
    const certified = CERTIFIED_TRANSITIONS[state];
    const actual = T[state];
    assert.ok(Array.isArray(actual), 'missing transition list for ' + state);
    assert.equal(Object.isFrozen(actual), true, 'transition list for ' + state + ' must be frozen');

    for (const target of certified) {
      assert.equal(actual.includes(target), true,
        'certified edge ' + state + ' -> ' + target + ' must be preserved verbatim');
    }
    /* certified edges must appear first and in order — no reordering, no removal. */
    assert.deepEqual(actual.slice(0, certified.length), certified,
      'certified edges for ' + state + ' must be preserved in order');

    /* every appended edge may only terminate in one of the two NEW states. */
    for (const target of actual.slice(certified.length)) {
      assert.equal(NEW_STATES.includes(target), true,
        'appended edge ' + state + ' -> ' + target + ' must terminate in a new state only');
    }
  }
});

/* ═══════════════════════════ SCN-017-004 ═══════════════════════════════ */

test('SCN-017-004 The two new states are terminal and never reach the alert engine', () => {
  const RL = load();

  for (const s of NEW_STATES) {
    assert.equal(RL.ATTENTION_LIFECYCLE_STATES.includes(s), true, 'must declare new state ' + s);
    assert.deepEqual(RL.ATTENTION_LIFECYCLE_TRANSITIONS[s], [], s + ' must be terminal');
    assert.equal(CERTIFIED_STATES.includes(s), false,
      s + ' must NOT be smuggled into the certified alert-engine vocabulary');
  }

  /* a terminal new state accepts no further transition. */
  const item = mustBuild();
  let cur = item;
  for (const to of ['evidence-building', 'qualified', 'acknowledged', 'monitoring', 'escalated']) {
    const step = RL.applyAttentionLifecycleEvent(cur, { to, at: '2026-07-24T14:00:00.000Z', condition: 'observed', ref: null });
    if (step.ok !== true) { cur = null; break; }
    cur = step.item;
  }
  assert.notEqual(cur, null, 'the path into escalated must itself be a legal appended edge');

  const after = RL.applyAttentionLifecycleEvent(cur, { to: 'monitoring', at: '2026-07-24T15:00:00.000Z', condition: 'observed', ref: null });
  assert.equal(after.ok, false, 'no edge may leave a terminal new state');
  assert.equal(after.code, 'RLATTN-LIFECYCLE');
});

/* ═══════════════════════════ SCN-017-005 ═══════════════════════════════ */

test('SCN-017-005 A headline of one hundred and twenty one characters is refused', () => {
  /* recorded defect: a 400-character headline was published verbatim. */
  const bloated = 'A'.repeat(400);
  const r400 = built(null, { headline: bloated });
  assert.equal(r400.ok, false, 'a 400-character headline must be refused, not truncated');
  assert.equal(r400.code, 'RLATTN-HEADLINE');
  assert.equal(r400.field, 'headline');
  assert.equal(JSON.stringify(r400).includes(bloated), false,
    'the refusal must not echo the oversized headline back');

  /* boundary pair, derived from the module output — not from the fixture. */
  const at120 = mustBuild(null, { headline: 'B'.repeat(120) });
  assert.equal(at120.headline.length, 120, 'exactly 120 characters is accepted intact');

  const at121 = built(null, { headline: 'B'.repeat(121) });
  assert.equal(at121.ok, false, 'exactly 121 characters is refused');
  assert.equal(at121.code, 'RLATTN-HEADLINE');
});

/* ═══════════════════════════ SCN-017-006 ═══════════════════════════════ */

test('SCN-017-006 An item with no invalidation is refused', () => {
  for (const empty of [undefined, null, '', '   ']) {
    const r = built(null, { invalidation: empty });
    assert.equal(r.ok, false, 'a non-falsifiable item must be refused: ' + JSON.stringify(empty));
    assert.equal(r.code, 'RLATTN-FALSIFIABILITY');
    assert.equal(r.field, 'invalidation');
  }

  const ok = mustBuild();
  assert.equal(typeof ok.invalidation, 'string');
  assert.ok(ok.invalidation.length > 0);
});

/* ═══════════════════════════ SCN-017-007 ═══════════════════════════════ */

test('SCN-017-007 A missing escalation trigger and a missing expiry each refuse', () => {
  const noTrigger = built(null, { escalationTrigger: null });
  assert.equal(noTrigger.ok, false);
  assert.equal(noTrigger.code, 'RLATTN-FALSIFIABILITY');
  assert.equal(noTrigger.field, 'escalationTrigger');

  const noExpiry = built(null, { expiry: null });
  assert.equal(noExpiry.ok, false);
  assert.equal(noExpiry.code, 'RLATTN-FALSIFIABILITY');
  assert.equal(noExpiry.field, 'expiry');

  /* both present -> accepted, and validate() agrees with build(). */
  const RL = load();
  const item = mustBuild();
  const v = RL.validateAttentionItem(item, ctx());
  assert.equal(v.ok, true, 'a fully falsifiable item must validate: ' + JSON.stringify(v.violations));
  assert.deepEqual(v.violations, []);
});

/* ═══════════════════════════ SCN-017-008 ═══════════════════════════════ */

test('SCN-017-008 An unknown window or an unresolvable date is refused', () => {
  const RL = load();

  const unknown = RL.resolveDecisionWindow('lunchtime', TRADING_DATE, CALENDAR, WINDOW_VOCABULARY);
  assert.equal(unknown.ok, false);
  assert.equal(unknown.code, 'RLATTN-WINDOW');

  const unresolvable = RL.resolveDecisionWindow('pre-close', '2029-12-25', CALENDAR, WINDOW_VOCABULARY);
  assert.equal(unresolvable.ok, false, 'a date outside the supplied calendar is unresolvable');
  assert.equal(unresolvable.code, 'RLATTN-WINDOW');

  const malformed = RL.resolveDecisionWindow('pre-close', 'not-a-date', CALENDAR, WINDOW_VOCABULARY);
  assert.equal(malformed.ok, false);
  assert.equal(malformed.code, 'RLATTN-WINDOW');

  /* an unknown authored window refuses through the item builder too. */
  const item = built(null, { decisionWindow: 'lunchtime' });
  assert.equal(item.ok, false);
  assert.equal(item.code, 'RLATTN-WINDOW');
});

/* ═══════════════════════════ SCN-017-009 ═══════════════════════════════ */

test('SCN-017-009 A non-trading date and an elapsed session resolve to the next session open', () => {
  const RL = load();
  const nextSession = CALENDAR.sessions[1];

  /* 2026-07-25 is not in the observed session list (non-trading). */
  const nonTrading = RL.resolveDecisionWindow('pre-market', '2026-07-25', CALENDAR, WINDOW_VOCABULARY);
  assert.equal(nonTrading.ok, true, 'a non-trading date rolls forward: ' + JSON.stringify(nonTrading));
  assert.equal(nonTrading.tradingDate, nextSession.tradingDate);
  assert.equal(nonTrading.resolvedFrom, 'next-session-open');
  assert.equal(new Date(nonTrading.boundaryUtc).getTime() < new Date(nextSession.opensUtc).getTime(), true,
    'pre-market anchors before the next session open');

  /* an elapsed session: the pre-close boundary for 07-24 is already past. */
  const elapsed = RL.resolveDecisionWindow('pre-close', TRADING_DATE, CALENDAR, WINDOW_VOCABULARY,
    { nowIso: '2026-07-24T23:59:00.000Z' });
  if (elapsed.ok === true && elapsed.resolvedFrom === 'next-session-open') {
    assert.equal(elapsed.tradingDate, nextSession.tradingDate);
  } else {
    assert.equal(elapsed.ok, true, 'an elapsed session must resolve, not throw: ' + JSON.stringify(elapsed));
    assert.equal(elapsed.tradingDate, TRADING_DATE);
  }

  /* a live session resolves in-session, deriving the boundary from the calendar. */
  const live = RL.resolveDecisionWindow('pre-close', TRADING_DATE, CALENDAR, WINDOW_VOCABULARY);
  assert.equal(live.ok, true);
  assert.equal(live.windowId, 'pre-close');
  assert.equal(new Date(live.boundaryUtc).getTime() <
    new Date(CALENDAR.sessions[0].closesUtc).getTime(), true,
    'pre-close anchors before the observed close');
});

/* ═══════════════════════════ SCN-017-010 ═══════════════════════════════ */

test('SCN-017-010 Decision window and horizon are independent', () => {
  const a = mustBuild(null, { decisionWindow: 'pre-market', horizon: 'this-week' });
  const b = mustBuild(null, { decisionWindow: 'pre-market', horizon: 'this-quarter' });
  const c = mustBuild(null, { decisionWindow: 'after-hours', horizon: 'this-week' });

  assert.equal(a.decisionWindow, b.decisionWindow, 'changing the horizon must not change the window');
  assert.notEqual(a.horizon, b.horizon);
  assert.equal(a.horizon, c.horizon, 'changing the window must not change the horizon');
  assert.notEqual(a.decisionWindow, c.decisionWindow);

  /* every declared window pairs with every horizon. */
  const RL = load();
  for (const w of RL.DECISION_WINDOWS) {
    for (const h of ['today', 'this-week', 'this-quarter']) {
      const item = mustBuild(null, { decisionWindow: w, horizon: h });
      assert.equal(item.decisionWindow, w);
      assert.equal(item.horizon, h);
    }
  }
});

/* ═══════════════════════════ SCN-017-011 ═══════════════════════════════ */

test('SCN-017-011 Action, disputed and unavailable dispositions never become attention items', () => {
  for (const disposition of ['action', 'disputed', 'unavailable']) {
    const r = built({ disposition });
    assert.equal(r.ok, false, disposition + ' must never become an attention item');
    assert.equal(r.code, 'RLATTN-DISPOSITION');
    assert.equal(r.field, 'disposition');
  }

  const ok = built({ disposition: 'attention' });
  assert.equal(ok.ok, true, 'the attention disposition is the only admitted one');
});

/* ═══════════════════════════ SCN-017-012 ═══════════════════════════════ */

test('SCN-017-012 A subject that overlaps a published action is refused', () => {
  const r = built({ subject: 'HYG' }, null, { publishedActionSubjects: ['HYG'] });
  assert.equal(r.ok, false, 'a subject already published as an action must not be re-surfaced');
  assert.equal(r.code, 'RLATTN-OVERLAP');
  assert.equal(r.field, 'subject');

  const clear = built({ subject: 'HYG' }, null, { publishedActionSubjects: ['TLT'] });
  assert.equal(clear.ok, true, 'a non-overlapping subject is admitted');
});

/* ═══════════════════════════ SCN-017-013 ═══════════════════════════════ */

test('SCN-017-013 An off-watchlist subject or any position field is refused', () => {
  const off = built({ subject: 'NVDA' });
  assert.equal(off.ok, false, 'NVDA is not in the observed watchlist scope');
  assert.equal(off.code, 'RLATTN-PRIVACY');
  assert.equal(off.field, 'subject');

  for (const field of ['size', 'quantity', 'costBasis', 'pnl']) {
    const leak = {};
    leak[field] = field === 'costBasis' ? 84.21 : 1200;
    const r = built(leak);
    assert.equal(r.ok, false, 'position field must be refused: ' + field);
    assert.equal(r.code, 'RLATTN-PRIVACY');
    assert.equal(r.field, field);
  }

  /* and a clean on-watchlist item carries no position field through. */
  const item = mustBuild({ subject: 'TLT' });
  const serialized = JSON.stringify(item);
  for (const field of ['size', 'quantity', 'costBasis', 'pnl']) {
    assert.equal(serialized.includes('"' + field + '"'), false,
      'no position field may survive into the item: ' + field);
  }
});

/* ═══════════════════════════ SCN-017-014 ═══════════════════════════════ */

test('SCN-017-014 An empty transmission path without an explicit absence marker is refused', () => {
  const bare = built({ transmissionPath: [], transmissionAbsenceNote: null });
  assert.equal(bare.ok, false, 'an empty path must not be published silently');
  assert.equal(bare.code, 'RLATTN-TRANSMISSION');

  const marked = built({ transmissionPath: [], transmissionAbsenceNote: 'No transmission channel is identified yet.' });
  assert.equal(marked.ok, true, 'an explicit absence marker admits the empty path: ' + JSON.stringify(marked));

  /* an off-vocabulary channel is refused: the module must not invent channels. */
  const invented = built({ transmissionPath: ['meme-flow'] });
  assert.equal(invented.ok, false);
  assert.equal(invented.code, 'RLATTN-TRANSMISSION');

  /* every certified channel is admitted. */
  for (const channel of TRANSMISSION_CHANNELS) {
    const item = mustBuild({ transmissionPath: [channel] });
    assert.deepEqual(item.transmissionPath.slice(), [channel]);
  }
});

/* ═══════════════════════════ SCN-017-015 ═══════════════════════════════ */

test('SCN-017-015 An absent market confirmation without a note is refused', () => {
  const bare = built({ marketConfirmation: { state: 'absent', detail: null }, marketConfirmationNote: null });
  assert.equal(bare.ok, false, 'an unconfirmed item must say so explicitly');
  assert.equal(bare.code, 'RLATTN-CONFIRMATION');

  const noted = built({
    marketConfirmation: { state: 'absent', detail: null },
    marketConfirmationNote: 'No market confirmation is visible in the observed instruments yet.'
  });
  assert.equal(noted.ok, true, 'an explicit note admits the absent confirmation: ' + JSON.stringify(noted));
  assert.equal(noted.item.marketConfirmation.state, 'absent',
    'the absent state must survive into the item, not be silently upgraded');
});

/* ═══════════════════════════ SCN-017-016 ═══════════════════════════════ */

test('SCN-017-016 A figure with no provenance does not render', () => {
  const orphan = built({
    figures: [{ label: 'HYG-IEF spread change', value: '+18bp', provenance: null }]
  });
  assert.equal(orphan.ok, false, 'an unprovenanced figure must not reach the reader');
  assert.equal(orphan.code, 'RLATTN-PROVENANCE');

  const RL = load();
  const item = mustBuild();
  const vm = RL.toViewModel(item, ctx());

  assert.equal(typeof vm, 'object');
  assert.equal(vm === null, false);
  const flat = JSON.stringify(vm);
  assert.equal(/<[a-z/!]/i.test(flat), false, 'the view model must never carry markup: ' + flat.slice(0, 200));
  assert.equal(flat.includes('&lt;'), false, 'the view model must never carry escaped markup');

  for (const fig of (vm.figures || [])) {
    assert.notEqual(fig.provenance, null, 'every rendered figure carries provenance');
    assert.notEqual(fig.provenance, undefined);
  }
});

/* ═══════════════════════════ SCN-017-017 ═══════════════════════════════ */

test('SCN-017-017 A verb outside the research vocabulary is refused', () => {
  for (const verb of ['buy', 'sell', 'hedge', 'rebalance', 'trim', 'execute']) {
    const r = built(null, { verb });
    assert.equal(r.ok, false, 'an execution verb must be refused: ' + verb);
    assert.equal(r.code, 'RLATTN-VERB');
    assert.equal(r.field, 'verb');
  }

  for (const verb of RESEARCH_VERBS) {
    const item = mustBuild(null, { verb });
    assert.equal(item.verb, verb, 'every certified research verb is admitted: ' + verb);
  }
});

/* ═══════════════════════════ SCN-017-018 ═══════════════════════════════ */

test('SCN-017-018 Ranking is a total order and stable across shuffled inputs', () => {
  const RL = load();

  const fixtures = [
    mustBuild({ subject: 'HYG', severity: 'severe', imminence: 'imminent', transmissionPath: ['credit-funding'] }, { headline: 'Credit funding stress broadens across issuers' }),
    mustBuild({ subject: 'TLT', severity: 'moderate', imminence: 'imminent', transmissionPath: ['rates-liquidity'] }, { headline: 'Long-duration liquidity thins into the auction' }),
    mustBuild({ subject: 'SPY', severity: 'moderate', imminence: 'developing', transmissionPath: ['breadth-market-structure'] }, { headline: 'Market breadth narrows for a third session' }),
    mustBuild({ subject: 'EURUSD', severity: 'mild', imminence: 'imminent', transmissionPath: ['fx-carry'] }, { headline: 'Carry unwind pressure builds in the euro cross' }),
    mustBuild({ subject: 'HYG', severity: 'mild', imminence: 'developing', transmissionPath: ['credit-funding'] }, { headline: 'Secondary credit liquidity remains patchy' }),
    mustBuild({ subject: 'TLT', severity: 'severe', imminence: 'developing', transmissionPath: [] }, { headline: 'Duration positioning is crowded on the long end' }, null)
  ];

  const baseline = JSON.stringify(RL.rankAttentionItems(fixtures));
  assert.notEqual(baseline, undefined);

  const rnd = lcg(20260724);
  for (let i = 0; i < 120; i++) {
    const permuted = shuffle(fixtures, rnd);
    const ranked = RL.rankAttentionItems(permuted);
    assert.equal(JSON.stringify(ranked), baseline,
      'ranking must be byte-identical under permutation #' + i + ' (no clock, no randomness)');
    assert.equal(ranked.length, fixtures.length, 'ranking must not add or drop items');
    assert.notEqual(ranked, permuted, 'rankAttentionItems must return a new array');
  }

  /* total order: no two ranked items compare equal. */
  const ranked = RL.rankAttentionItems(fixtures);
  for (let i = 1; i < ranked.length; i++) {
    assert.notEqual(JSON.stringify(ranked[i - 1]), JSON.stringify(ranked[i]),
      'a total order admits no tie at position ' + i);
  }
});

/* ═══════════════════════════ SCN-017-019 ═══════════════════════════════ */

test('SCN-017-019 A severe unmapped item ranks below a moderate imminent item', () => {
  const RL = load();

  /* deliberately the HIGHEST severity, but no transmission channel mapped. */
  const severeUnmapped = mustBuild({
    subject: 'SPY', severity: 'severe', imminence: 'developing',
    transmissionPath: [], transmissionAbsenceNote: 'No transmission channel is identified yet.'
  }, { headline: 'Index-level dispersion widens with no identified channel' });

  const moderateImminent = mustBuild({
    subject: 'TLT', severity: 'moderate', imminence: 'imminent',
    transmissionPath: ['rates-liquidity']
  }, { headline: 'Long-duration liquidity thins into the auction' });

  assert.equal(severeUnmapped.severity, 'severe');
  assert.equal(moderateImminent.severity, 'moderate');
  assert.deepEqual(severeUnmapped.transmissionPath.slice(), [],
    'the severe item must genuinely carry no mapped channel');

  const ranked = RL.rankAttentionItems([severeUnmapped, moderateImminent]);
  const idxSevere = ranked.findIndex((it) => it.subject === 'SPY');
  const idxModerate = ranked.findIndex((it) => it.subject === 'TLT');

  assert.notEqual(idxSevere, -1);
  assert.notEqual(idxModerate, -1);
  assert.equal(idxModerate < idxSevere, true,
    'severity must not leak into the rank key: the mapped, imminent item ranks first');
});

/* ═══════════════════════════ SCN-017-020 ═══════════════════════════════ */

test('SCN-017-020 The ranking rationale is reader language with no internal identifier', () => {
  const RL = load();

  const higher = mustBuild({ subject: 'TLT', severity: 'moderate', imminence: 'imminent', transmissionPath: ['rates-liquidity'] },
    { headline: 'Long-duration liquidity thins into the auction' });
  const lower = mustBuild({ subject: 'SPY', severity: 'severe', imminence: 'developing', transmissionPath: [], transmissionAbsenceNote: 'No transmission channel is identified yet.' },
    { headline: 'Index-level dispersion widens with no identified channel' });

  const sentence = RL.rankRationale(higher, lower);

  assert.equal(typeof sentence, 'string');
  assert.ok(sentence.trim().length > 0, 'the rationale must not be empty');
  assert.equal(sentence.trim().split(/(?<=\.)\s+/).length, 1, 'the rationale is one sentence');
  assert.match(sentence.trim(), /\.$/, 'the rationale ends as a sentence');

  for (const leak of ['RLATTN-', 'SCN-', 'sha256:', '/v1', 'low-noise-gate', 'Scope ']) {
    assert.equal(sentence.includes(leak), false, 'internal identifier leaked into reader text: ' + leak);
  }
});

/* ═══════════════════════════ SCN-017-021 ═══════════════════════════════ */

test('SCN-017-021 Zero qualifying items yields an explicit nothing-requires-attention state', () => {
  const RL = load();

  const empty = RL.selectAttentionItems([], 7);
  assert.deepEqual(empty.published, []);
  assert.deepEqual(empty.suppressed, []);
  assert.equal(empty.capApplied, false, 'an empty set never trips the cap');

  /* the interruption rate is explicit about an insufficient closed sample. */
  const rate = RL.computeInterruptionRate([], { minClosedSample: 20 }, '2026-07-24T20:00:00.000Z');
  assert.equal(typeof rate, 'object');
  assert.equal(rate === null, false);
  assert.equal(rate.contractVersion, 'interruption-rate/v1');
  assert.equal(rate.closedSample, 0);
  assert.equal(rate.sufficientSample, false,
    'a zero-length closed sample must never report a usable rate');
  assert.equal(rate.rate === null || rate.rate === undefined, true,
    'no rate may be published below the minimum closed sample');
});

/* ═══════════════════════════ SCN-017-021b ══════════════════════════════ */

test('SCN-017-021b The record publishes the wasted share beside the warranted one', () => {
  const RL = load();
  const closure = (outcomeClass, i) => ({ outcomeClass, itemId: 'item-' + i });

  // 20 closed = exactly the minimum: 15 that mattered, 5 that did not.
  const closed = []
    .concat([0, 1, 2, 3, 4].map((i) => closure('confirmed', i)))
    .concat([0, 1, 2, 3, 4].map((i) => closure('resolved', 10 + i)))
    .concat([0, 1, 2, 3, 4].map((i) => closure('escalated', 20 + i)))
    .concat([0, 1, 2, 3, 4].map((i) => closure('expired-without-effect', 30 + i)));

  const at = RL.computeInterruptionRate(closed, { minClosedSample: 20 }, '2026-08-07T12:00:00.000Z');
  assert.equal(at.closedSample, 20);
  assert.equal(at.warrantedShare, 0.75, 'the warranted share is 15 of 20');
  assert.equal(at.expiredWithoutEffectShare, 0.25, 'the wasted share is 5 of 20');
  assert.equal(at.expiredWithoutEffectCount, 5);
  assert.equal(at.warrantedShare + at.expiredWithoutEffectShare, 1,
    'the two shares partition the closed sample, so a reader cannot be shown only the flattering half');
  assert.equal(at.rate, at.warrantedShare, 'rate stays the warranted share for existing consumers');
  assert.match(at.statement, /5 expired without effect/,
    'the statement names the wasted interruptions, not only the ones that mattered');

  // One below the minimum withholds BOTH sides — never a zero for the wasted share.
  const below = RL.computeInterruptionRate(closed.slice(0, 19), { minClosedSample: 20 }, '2026-08-07T12:00:00.000Z');
  assert.equal(below.sufficientSample, false);
  assert.equal(below.warrantedShare, null, 'the warranted share is withheld below the minimum');
  assert.equal(below.expiredWithoutEffectShare, null,
    'the wasted share is withheld too — publishing 0 here would read as "we never waste an interruption"');
});

/* ═══════════════════════════ SCN-017-022 ═══════════════════════════════ */

test('SCN-017-022 The cap of seven is a ceiling and never a quota', () => {
  const RL = load();

  const three = [0, 1, 2].map((i) => mustBuild(
    { subject: WATCHLIST[i % WATCHLIST.length], severity: 'moderate', imminence: 'imminent' },
    { headline: 'Observed condition number ' + i + ' persists into the close' }
  ));
  const under = RL.selectAttentionItems(three, 7);
  assert.equal(under.published.length, 3, 'the cap must not pad up to a quota');
  assert.deepEqual(under.suppressed, []);
  assert.equal(under.capApplied, false);

  const twelve = [];
  for (let i = 0; i < 12; i++) {
    twelve.push(mustBuild(
      { subject: WATCHLIST[i % WATCHLIST.length], severity: 'moderate', imminence: i % 2 ? 'imminent' : 'developing' },
      { headline: 'Observed condition number ' + i + ' persists into the close' }
    ));
  }
  const over = RL.selectAttentionItems(twelve, 7);
  assert.equal(over.published.length, 7, 'the ceiling caps publication at seven');
  assert.equal(over.suppressed.length, 5, 'the remainder is suppressed, not dropped silently');
  assert.equal(over.capApplied, true);

  /* the published set is the top of the module's own ranking. */
  const ranked = RL.rankAttentionItems(twelve);
  assert.equal(JSON.stringify(over.published), JSON.stringify(ranked.slice(0, 7)),
    'the published set must be the highest-ranked seven');
});

/* ═══════════════════════════ SCN-017-023 ═══════════════════════════════ */

test('SCN-017-023 An illegal lifecycle edge is refused', () => {
  const RL = load();
  const item = mustBuild();

  const skip = RL.applyAttentionLifecycleEvent(item, { to: 'resolved', at: '2026-07-24T14:00:00.000Z', condition: 'observed', ref: null });
  assert.equal(skip.ok, false, 'a state may not be skipped');
  assert.equal(skip.code, 'RLATTN-LIFECYCLE');

  const unknown = RL.applyAttentionLifecycleEvent(item, { to: 'archived', at: '2026-07-24T14:00:00.000Z', condition: 'observed', ref: null });
  assert.equal(unknown.ok, false, 'an unknown target state is refused');
  assert.equal(unknown.code, 'RLATTN-LIFECYCLE');

  /* the legal first edge is accepted and appends, never rewrites. */
  const legal = RL.applyAttentionLifecycleEvent(item, { to: 'evidence-building', at: '2026-07-24T14:00:00.000Z', condition: 'observed', ref: null });
  assert.equal(legal.ok, true, 'the certified first edge must be accepted: ' + JSON.stringify(legal));
  assert.equal(legal.item.state, 'evidence-building');
  assert.equal(item.state !== 'evidence-building' || item === legal.item, true);
  assert.equal(Array.isArray(legal.item.lifecycle), true, 'lifecycle history is append-only');
  assert.equal(legal.item.lifecycle.length > 0, true);
});

/* ═══════════════════════════ SCN-017-024 ═══════════════════════════════ */

test('SCN-017-024 Supersession closes the prior item in the same generation with a back-reference', () => {
  const RL = load();

  const prior = mustBuild({ subject: 'HYG' }, { headline: 'High-yield credit spreads widened for a fifth straight session' });
  const successor = mustBuild({ subject: 'HYG' }, { headline: 'High-yield credit spreads widened for a sixth straight session' });

  assert.notEqual(prior.id, undefined, 'items carry a stable identifier');
  assert.notEqual(prior.id, successor.id, 'the successor is a distinct item');

  const closed = RL.applyAttentionLifecycleEvent(prior, {
    to: 'superseded', at: '2026-07-25T13:30:00.000Z', condition: 'superseded-by-successor', ref: successor.id
  });
  assert.equal(closed.ok, true, 'supersession must be a legal appended edge: ' + JSON.stringify(closed));
  assert.equal(closed.item.state, 'superseded');
  assert.equal(closed.item.supersededBy, successor.id, 'the prior item carries a back-reference');
  assert.deepEqual(RL.ATTENTION_LIFECYCLE_TRANSITIONS['superseded'], [], 'supersession is terminal');

  /* supersession without a back-reference is refused. */
  const dangling = RL.applyAttentionLifecycleEvent(prior, {
    to: 'superseded', at: '2026-07-25T13:30:00.000Z', condition: 'superseded-by-successor', ref: null
  });
  assert.equal(dangling.ok, false, 'a superseding close must name its successor');
  assert.equal(dangling.code, 'RLATTN-LIFECYCLE');

  /* the closure derives an outcome record in the same generation. */
  const outcome = RL.deriveOutcomeRecord(closed.item, {
    closedAt: '2026-07-25T13:30:00.000Z', outcomeClass: 'resolved', note: 'Superseded by the sixth-session reading.'
  });
  assert.equal(outcome.ok, true, 'a closed item must derive an outcome record: ' + JSON.stringify(outcome));
  assert.equal(RL.TERMINAL_OUTCOME_CLASSES.includes(outcome.record.outcomeClass), true);
  assert.equal(outcome.record.itemId, prior.id, 'the outcome record points back at the closed item');
  assert.equal(outcome.record.supersededBy, successor.id, 'the back-reference survives into the record');

  /* an open item cannot produce an outcome record. */
  const premature = RL.deriveOutcomeRecord(prior, {
    closedAt: '2026-07-25T13:30:00.000Z', outcomeClass: 'resolved', note: 'not closed'
  });
  assert.equal(premature.ok, false, 'an open item has no outcome');
  assert.equal(premature.code, 'RLATTN-LIFECYCLE');
});

/* ═══════════════════════════ SCN-017-046 ═══════════════════════════════ */

test('SCN-017-046 A terminal-state item is excluded from selection entirely', () => {
  const RL = load();

  /* the terminal vocabulary is DERIVED from the module's own transition table
     — a state with no outgoing edge — never restated here as a literal list. */
  const terminal = RL.ATTENTION_LIFECYCLE_STATES
    .filter((s) => RL.ATTENTION_LIFECYCLE_TRANSITIONS[s].length === 0);
  assert.equal(terminal.length > 0, true, 'the lifecycle must declare at least one terminal state');

  /* the shortest real walk out of a live state into a terminal one, computed
     over the module's declared edges so this test moves with the contract. */
  function shortestPathToTerminal(from) {
    const seen = new Set([from]);
    const queue = [[from, []]];
    while (queue.length > 0) {
      const [state, path] = queue.shift();
      if (terminal.includes(state)) return path;
      for (const next of RL.ATTENTION_LIFECYCLE_TRANSITIONS[state]) {
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push([next, path.concat(next)]);
      }
    }
    return null;
  }

  const live = mustBuild(
    { subject: 'SPY' },
    { headline: 'Equity index breadth narrowed for a third straight session' }
  );
  const standingDown = mustBuild(
    { subject: 'HYG' },
    { headline: 'High-yield credit spreads widened for a fifth straight session' }
  );
  assert.notEqual(live.id, standingDown.id, 'the two fixtures must be distinct items');

  /* PRECONDITION: BOTH fixtures are genuinely live before the transition, so
     the assertion below cannot be satisfied by an item that never published. */
  const before = RL.selectAttentionItems([live, standingDown], 7);
  assert.equal(before.published.length, 2,
    'both fixtures must publish before either stands down, otherwise this scenario is vacuous');

  const path = shortestPathToTerminal(standingDown.state);
  assert.equal(Array.isArray(path) && path.length > 0, true,
    'a live item must be able to reach a terminal state over declared edges');

  /* a REAL walk through the frozen module, never a hand-stamped state field. */
  let cur = standingDown;
  for (let i = 0; i < path.length; i++) {
    const step = RL.applyAttentionLifecycleEvent(cur, {
      to: path[i],
      at: new Date(Date.parse(cur.observedAt) + (i + 1) * 60000).toISOString(),
      condition: 'The declared trigger for this edge was observed.',
      /* supplied on every step so the walk holds for whichever terminal edge
         the table yields; only a closing edge actually requires a successor. */
      ref: live.id
    });
    assert.equal(step.ok, true,
      'edge ' + cur.state + ' -> ' + path[i] + ' must be declared: ' + JSON.stringify(step));
    cur = step.item;
  }
  assert.equal(terminal.includes(cur.state), true, 'the walk must land in a terminal state');

  const after = RL.selectAttentionItems([live, cur], 7);
  const publishedIds = after.published.map((item) => item.id);
  const suppressedIds = after.suppressed.map((item) => item.id);

  assert.deepEqual(publishedIds, [live.id],
    'only the live item is published: ' + JSON.stringify(publishedIds));
  assert.equal(suppressedIds.includes(cur.id), false,
    'an item that stood down left the tier and was never held back by the ceiling, so it is absent '
      + 'from suppressed as well: ' + JSON.stringify(suppressedIds));
  assert.deepEqual(after.suppressed, [], 'suppressed is a cap-overflow set, not a rejection set');
  assert.equal(after.capApplied, false, 'no live item was displaced by the cap');
});

/* ═══════════════════════════ SCN-017-060 ═══════════════════════════════ */

/* F-017-04 — rankRationale emits the comparative mirror unconditionally. When
   two adjacent items share a subject AND resolve to the same urgency and
   transmission clauses, the rendered page reads, verbatim:

     "QQQ is placed above QQQ because its effect is already arriving and a
      transmission channel is identified, while for QQQ its effect is already
      arriving and a transmission channel is identified."

   Literally true and completely useless, which is worse than silence because it
   spends the reader's trust. Two items sharing a ticker is VALID — there is no
   subject-uniqueness rule and the committed payload has carried QQQ at two
   ranks for different reasons — so the defect is in the SENTENCE, never in a
   uniqueness constraint. That premise is asserted below BEFORE the pathology,
   so a "fix" that forbade the duplicate subject would fail this test rather
   than satisfy it.

   Nothing here pins production prose. The ranking connector and both reason
   clauses are EXTRACTED from production's own output for DIFFERENT invocations,
   so every assertion survives a rewording and still names the exact pathology. */

test('SCN-017-060 The rank rationale never renders a vacuous self-comparison', () => {
  const RL = load();
  const SCOPE = WATCHLIST.concat(['QQQ']);

  /* two OBSERVED profiles that resolve to different urgency and different
     transmission clauses. Observations only; production derives the prose. */
  const ARRIVING_MAPPED = {
    imminence: 'imminent', transmissionPath: ['rates-liquidity'], transmissionAbsenceNote: null
  };
  const DORMANT_UNMAPPED = {
    imminence: 'latent', transmissionPath: [], transmissionAbsenceNote: 'No transmission channel is identified yet.'
  };

  function item(subject, profile, headline) {
    return mustBuild(Object.assign({ subject: subject }, profile), { headline: headline },
      { watchlistScope: SCOPE });
  }

  function countOccurrences(haystack, needle) {
    if (!needle) return 0;
    let seen = 0;
    let from = 0;
    for (;;) {
      const at = haystack.indexOf(needle, from);
      if (at === -1) return seen;
      seen += 1;
      from = at + 1;
    }
  }

  /* the longest substring occurring at least twice. Run over a mirror built
     from two items with IDENTICAL clause inputs, this recovers exactly the
     duplicated reason clause from production output instead of transcribing
     it, so the assertions below cannot be invalidated by a rewording. */
  function longestRepeatedSubstring(text) {
    let best = '';
    for (let i = 0; i < text.length; i++) {
      for (let len = best.length + 1; i + len <= text.length; len++) {
        const candidate = text.slice(i, i + len);
        if (text.indexOf(candidate, i + 1) === -1) break;
        best = candidate;
      }
    }
    return best;
  }

  const spyArriving = item('SPY', ARRIVING_MAPPED, 'Index liquidity thins into the auction');
  const tltArriving = item('TLT', ARRIVING_MAPPED, 'Long-duration liquidity thins into the auction');
  const spyDormant = item('SPY', DORMANT_UNMAPPED, 'Index dispersion widens with no identified channel');
  const tltDormant = item('TLT', DORMANT_UNMAPPED, 'Long-duration dispersion widens with no identified channel');

  /* ── recover the connector and both reason clauses FROM production ─────── */

  const mirrorArriving = RL.rankRationale(spyArriving, tltArriving);
  const mirrorDormant = RL.rankRationale(spyDormant, tltDormant);

  const higherAt = mirrorArriving.indexOf('SPY');
  const lowerAt = mirrorArriving.indexOf('TLT');
  assert.equal(higherAt !== -1 && lowerAt > higherAt, true,
    'the comparative must name the higher subject before the lower one: ' + JSON.stringify(mirrorArriving));
  const CONNECTOR = mirrorArriving.slice(higherAt + 'SPY'.length, lowerAt);

  const ARRIVING_CLAUSE = longestRepeatedSubstring(mirrorArriving).trim();
  const DORMANT_CLAUSE = longestRepeatedSubstring(mirrorDormant).trim();

  /* the extraction itself must have found something real, else every check
     below would pass on an empty needle and prove nothing. */
  assert.equal(CONNECTOR.trim().length > 0, true,
    'the ranking connector must be recoverable from production output: ' + JSON.stringify(CONNECTOR));
  assert.equal(ARRIVING_CLAUSE.length > 20, true,
    'the arriving reason clause must be a real clause: ' + JSON.stringify(ARRIVING_CLAUSE));
  assert.equal(DORMANT_CLAUSE.length > 20, true,
    'the dormant reason clause must be a real clause: ' + JSON.stringify(DORMANT_CLAUSE));
  assert.notEqual(ARRIVING_CLAUSE, DORMANT_CLAUSE,
    'the two observed profiles must produce genuinely different reasons, else cases 2 and 3 are vacuous');
  assert.equal(countOccurrences(mirrorArriving, ARRIVING_CLAUSE), 2,
    'the extracted clause must be the one production already states on both sides: '
      + JSON.stringify(mirrorArriving));

  /* ── case 1 — same subject, IDENTICAL clauses: the mirror explains nothing ─ */

  const qqqOne = item('QQQ', ARRIVING_MAPPED, 'Zero-day dealer positioning concentrates into the close');
  const qqqTwo = item('QQQ', ARRIVING_MAPPED, 'The breadth add-gate narrows to a handful of leaders');

  assert.equal(qqqOne.subject, 'QQQ');
  assert.equal(qqqTwo.subject, qqqOne.subject, 'case 1 requires a shared subject');
  assert.equal(qqqOne.imminence, qqqTwo.imminence, 'case 1 requires an identical urgency input');
  assert.equal(qqqOne.transmissionPath.length > 0, true, 'case 1 requires a mapped higher item');
  assert.equal(qqqTwo.transmissionPath.length > 0, true, 'case 1 requires an identical transmission input');
  assert.notEqual(qqqOne.id, qqqTwo.id,
    'case 1 must compare two DISTINCT items, not one item against itself');

  /* the premise: sharing a ticker is legal, so the fix belongs in the sentence. */
  assert.equal(RL.validateAttentionItem(qqqOne, ctx({ watchlistScope: SCOPE })).ok, true,
    'a second item on the same subject is valid');
  assert.equal(RL.validateAttentionItem(qqqTwo, ctx({ watchlistScope: SCOPE })).ok, true,
    'a second item on the same subject is valid');
  const bothQqq = RL.selectAttentionItems([qqqOne, qqqTwo], 7);
  assert.equal(bothQqq.published.length, 2,
    'no subject-uniqueness rule exists — both QQQ items publish, so suppressing one is NOT the fix: '
      + JSON.stringify(bothQqq.published.map((it) => it.subject)));

  const raw = RL.rankRationale(qqqOne, qqqTwo);
  const vacuous = (raw === null || raw === undefined) ? '' : String(raw);

  assert.equal(vacuous.includes('QQQ' + CONNECTOR + 'QQQ'), false,
    'the rationale must never rank a subject above itself; got: ' + JSON.stringify(vacuous));
  assert.equal(countOccurrences(vacuous, ARRIVING_CLAUSE) <= 1, true,
    'the rationale must never state the identical reason on both sides of the comparison; got: '
      + JSON.stringify(vacuous));
  assert.notEqual(vacuous, mirrorArriving.split('SPY').join('QQQ').split('TLT').join('QQQ'),
    'the rationale must not be the comparative mirror with one name substituted on both sides; got: '
      + JSON.stringify(vacuous));

  /* ── case 2 — same subject, DIFFERENT clauses: the comparison is informative
        and MUST survive. This is the guard against an over-broad fix that
        suppresses every same-subject comparison. ────────────────────────────── */

  const qqqDormant = item('QQQ', DORMANT_UNMAPPED, 'Cross-asset follow-through has not started');

  assert.equal(qqqDormant.subject, qqqOne.subject, 'case 2 requires the same shared subject');
  assert.notEqual(qqqDormant.imminence, qqqOne.imminence, 'case 2 requires differing urgency inputs');
  assert.equal(qqqDormant.transmissionPath.length, 0, 'case 2 requires differing transmission inputs');

  const informative = RL.rankRationale(qqqOne, qqqDormant);
  assert.equal(typeof informative, 'string',
    'a same-subject comparison with differing reasons must still produce a sentence');
  assert.equal(informative.includes(ARRIVING_CLAUSE), true,
    'the higher item reason must survive a same-subject comparison; got: ' + JSON.stringify(informative));
  assert.equal(informative.includes(DORMANT_CLAUSE), true,
    'the DIFFERENTIATING lower reason must survive a same-subject comparison; got: '
      + JSON.stringify(informative));

  /* ── case 3 — different subjects: the existing comparative form is the
        regression surface and must be unchanged. ──────────────────────────── */

  const comparative = RL.rankRationale(tltArriving, spyDormant);

  assert.equal(typeof comparative, 'string');
  assert.equal(comparative.includes('TLT'), true, 'the higher subject label must appear');
  assert.equal(comparative.includes('SPY'), true, 'the lower subject label must appear');
  assert.equal(comparative.includes('TLT' + CONNECTOR + 'SPY'), true,
    'the comparative form for distinct subjects must be unchanged; got: ' + JSON.stringify(comparative));
  assert.equal(comparative.includes(ARRIVING_CLAUSE), true,
    'the higher reason must still be stated for distinct subjects; got: ' + JSON.stringify(comparative));
  assert.equal(comparative.includes(DORMANT_CLAUSE), true,
    'the lower reason must still be stated for distinct subjects; got: ' + JSON.stringify(comparative));
});

/* BS-017-018 / FR-018. The tier links rather than reimplements, so a reader can
   check the math where it is owned. The adversarial half is the point: an item
   that could carry any string could send a reader to a page that never produced
   its figure, and a fabricated link renders identically to a real one. */
test('SCN-017-064 An item deep-links to its owning tool and a fabricated link is refused', () => {
  const RL = load();
  const built = RL.buildAttentionItem(gateResult(), authored(), ctx());

  assert.equal(built.ok, true, 'a candidate naming a registered tool page must build; got: ' + JSON.stringify(built));
  assert.equal(built.item.deepLink, 'market-heatmap-lab.html',
    'the item must carry the deep link of the tool that owns its math');
  assert.equal(TOOL_DEEP_LINKS.includes(built.item.deepLink), true,
    'the carried link must be one the registry actually declares');

  /* the item links to the tool rather than restating its computation */
  assert.equal(built.item.deepLink.endsWith('.html'), true,
    'the deep link must address a tool page');

  const fabricated = RL.buildAttentionItem(
    gateResult({ deepLink: 'attacker-controlled-page.html' }), authored(), ctx());
  assert.equal(fabricated.ok, false, 'a link outside the registry allowlist must be refused');
  assert.equal(fabricated.code, 'RLATTN-DEEPLINK',
    'the refusal must name the deep-link contract; got: ' + JSON.stringify(fabricated));
  assert.equal(fabricated.field, 'deepLink');

  const missing = RL.buildAttentionItem(gateResult({ deepLink: undefined }), authored(), ctx());
  assert.equal(missing.ok, false, 'an item with no deep link must be refused, not published unlinked');
  assert.equal(missing.code, 'RLATTN-DEEPLINK');

  /* an empty allowlist must not become a pass-through */
  const noRegistry = RL.buildAttentionItem(gateResult(), authored(), ctx({ toolDeepLinks: [] }));
  assert.equal(noRegistry.ok, false, 'with no registered tool pages nothing may be linked');
  assert.equal(noRegistry.code, 'RLATTN-DEEPLINK');
});
