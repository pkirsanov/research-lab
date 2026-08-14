// Scope 02 analytic fixture generator. Deterministic closed-form series, no RNG.
// Each series is designed from its scenario's economic description BEFORE the engine
// is consulted; whatever the engine then reports is what the tests assert.
//
// Regenerate with:  node scripts/build-technique-series-fixture.mjs
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = resolve(ROOT, 'tests/fixtures/technical-analysis-decision/analytic/technique-series.json');
const BARS = 210;
const r2 = (x) => Math.round(x * 100) / 100;

// SCN-007-009: long quiet base, then a close beyond the base boundary on expansion volume.
function breakoutParticipation() {
  const rows = [];
  for (let i = 0; i < BARS; i += 1) {
    let close = 100 + Math.sin(i / 6) * 1.2;
    let volume = 100000 + (i % 5) * 2000;
    if (i >= BARS - 3) {
      close = 102.5 + (i - (BARS - 4)) * 1.35;
      volume = 300000 + (i - (BARS - 4)) * 90000;
    }
    const open = i === 0 ? close : rows[i - 1][3];
    const high = Math.max(open, close) + (i >= BARS - 3 ? 0.25 : 0.45);
    const low = Math.min(open, close) - (i >= BARS - 3 ? 0.9 : 0.45);
    rows.push([r2(open), r2(high), r2(low), r2(close), volume]);
  }
  return rows;
}

// SCN-007-010: a clean, persistent advance so every correlated trend and momentum
// transform reads positive at the same time. The point is the counting, not the direction.
function correlatedUptrend() {
  const rows = [];
  for (let i = 0; i < BARS; i += 1) {
    const close = 80 * Math.pow(1.0035, i) + Math.sin(i / 9) * 0.35;
    const open = i === 0 ? close : rows[i - 1][3];
    const high = Math.max(open, close) * 1.004;
    const low = Math.min(open, close) * 0.997;
    rows.push([r2(open), r2(high), r2(low), r2(close), 150000 + (i % 7) * 4000]);
  }
  return rows;
}

// SCN-007-011: a decline into a mature sideways range. No spring, no sign of strength,
// no confirmed range break — the range simply has not resolved.
function unresolvedRange() {
  const rows = [];
  for (let i = 0; i < BARS; i += 1) {
    const close = i < 110 ? 140 - i * 0.36 : 100.4 + Math.sin((i - 110) / 5) * 2.6;
    const open = i === 0 ? close : rows[i - 1][3];
    rows.push([r2(open), r2(Math.max(open, close) + 0.8), r2(Math.min(open, close) - 0.8), r2(close), 120000 + (i % 9) * 3000]);
  }
  return rows;
}

// A deterministic peer for relative strength: same clock, near-flat total return.
function peerBenchmark() {
  const rows = [];
  for (let i = 0; i < BARS; i += 1) {
    const close = 50 * Math.pow(1.0005, i);
    const open = i === 0 ? close : rows[i - 1][3];
    rows.push([r2(open), r2(Math.max(open, close) + 0.4), r2(Math.min(open, close) - 0.3), r2(close), 90000]);
  }
  return rows;
}

const fixture = {
  contractVersion: 'tad-analytic-fixture/v1',
  fixturePosture: 'analytic-deterministic',
  fixtureId: 'technique-engine-series',
  liveClaim: false,
  purpose: 'Deterministic closed-form OHLCV series that exercise Scope 02 technique formulas, evidence-family clustering, and claim admission. These are constructed analytic observations. They are not market data and they assert nothing about any real instrument.',
  barContract: {
    note: 'Rows are compact [open, high, low, close, volume]. Every row expands to one closed daily bar on the stated clock; the constant envelope fields are declared once here rather than repeated on every bar.',
    rowOrder: ['o', 'h', 'l', 'c', 'v'],
    interval: '1d',
    sessionId: 'xnys-analytic-core',
    status: 'closed',
    adjustmentPolicyId: 'analytic-total-return-v1',
    firstOpenedAt: '2025-09-02T13:30:00.000Z',
    barSpacingMs: 86400000,
    sessionDurationMs: 23400000,
    availableAfterCloseMs: 60000
  },
  derivation: {
    barCount: BARS,
    rounding: '2dp on open/high/low/close; integer volume',
    'breakout-participation': 'c = 100 + 1.2*sin(i/6), v = 100000 + 2000*(i mod 5); final 3 bars c = 102.5 + 1.35*(i-206), v = 300000 + 90000*(i-206)',
    'correlated-uptrend': 'c = 80*1.0035^i + 0.35*sin(i/9), v = 150000 + 4000*(i mod 7)',
    'unresolved-range': 'i<110: c = 140 - 0.36*i; i>=110: c = 100.4 + 2.6*sin((i-110)/5); v = 120000 + 3000*(i mod 9)',
    'peer-benchmark': 'c = 50*1.0005^i, v = 90000'
  },
  series: {
    'breakout-participation': { symbol: 'ANALYTIC-BREAKOUT', rows: breakoutParticipation() },
    'correlated-uptrend': { symbol: 'ANALYTIC-UPTREND', rows: correlatedUptrend() },
    'unresolved-range': { symbol: 'ANALYTIC-RANGE', rows: unresolvedRange() },
    'peer-benchmark': { symbol: 'ANALYTIC-PEER', rows: peerBenchmark() }
  }
};

writeFileSync(TARGET, JSON.stringify(fixture, null, 2) + '\n');
console.log('[technique-series] series=' + Object.keys(fixture.series).join(',') + ' bars=' + BARS);
