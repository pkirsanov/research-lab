/* Deterministic synthetic corpus for the overreaction snap-back scanner (rloverreaction.js).
 *
 * OVRA trends up for ~300 sessions, then drops 9.5% on six times its normal volume while its sector
 * (XFIX) and three peers fall about 1%, closes in the upper half of the drop-day range, and holds
 * above the drop-day low for the next two sessions while staying close to it. With the matching
 * evidence record (no company news, estimates barely cut, credit unmoved) that is a textbook
 * "overblown" case, and every scanner gate should pass. Tickers are synthetic on purpose: nothing
 * here describes a real company. */

const SESSIONS = 300;

function weekdays(startIso, n) {
  const out = [];
  let t = Date.parse(startIso + 'T13:30:00Z');
  while (out.length < n) {
    const day = new Date(t).getUTCDay();
    if (day !== 0 && day !== 6) out.push(t);
    t += 86400000;
  }
  return out;
}

function series(times, returns, startPrice, rangePct, volume) {
  const rows = [];
  let close = startPrice;
  for (let i = 0; i < times.length; i++) {
    const prev = close;
    close = prev * (1 + returns[i]);
    const hi = Math.max(prev, close) * (1 + rangePct / 2), lo = Math.min(prev, close) * (1 - rangePct / 2);
    rows.push({ t: times[i], o: prev, h: hi, l: lo, c: close, v: volume * (1 + 0.1 * Math.sin(i * 0.9)) });
  }
  return rows;
}

export function buildOverreactionFixture() {
  const times = weekdays('2025-06-02', SESSIONS);
  const shock = SESSIONS - 3; // drop day; two holding sessions follow it
  const sectorOsc = times.map((_, i) => 0.008 * Math.sin(i * 0.7));
  const sectorRet = sectorOsc.map((x, i) => (i === shock ? -0.01 : 0.0004 + x));
  const spyRet = times.map((_, i) => (i === shock ? -0.004 : 0.0005 + 0.006 * Math.sin(i * 0.7 + 0.3)));
  const stockRet = times.map((_, i) => 0.0013 + 1.2 * sectorOsc[i] + 0.004 * Math.cos(i * 1.3));
  const peerRet = (k) => times.map((_, i) => (i === shock ? -0.01 : 0.0009 + 1.1 * sectorOsc[i] + 0.003 * Math.cos(i * 1.1 + k)));

  const spy = series(times, spyRet, 400, 0.012, 8e7);
  const sector = series(times, sectorRet, 150, 0.012, 1e7);
  const peers = ['PEERB', 'PEERC', 'PEERD'].map((sym, k) => ({ sym, rows: series(times, peerRet(k), 80 + 10 * k, 0.015, 2e6) }));
  const ovra = series(times.slice(0, shock), stockRet.slice(0, shock), 100, 0.015, 1e6);
  const pre = ovra[shock - 1].c;
  ovra.push({ t: times[shock], o: pre * 0.92, h: pre * 0.925, l: pre * 0.88, c: pre * 0.905, v: 6e6 });
  ovra.push({ t: times[shock + 1], o: pre * 0.9, h: pre * 0.9, l: pre * 0.882, c: pre * 0.888, v: 2e6 });
  ovra.push({ t: times[shock + 2], o: pre * 0.888, h: pre * 0.895, l: pre * 0.884, c: pre * 0.89, v: 1.5e6 });

  const shockDate = new Date(times[shock]).toISOString().slice(0, 10);
  const lastDate = new Date(times[SESSIONS - 1]).toISOString().slice(0, 10);
  const sectorMap = {
    XFIX: { label: 'Fixture sector', constituents: [{ ticker: 'OVRA', name: 'Overreaction Fixture A', weight: 0.4 }].concat(peers.map((p) => ({ ticker: p.sym, name: p.sym, weight: 0.2 }))) }
  };
  const bars = { SPY: spy, XFIX: sector, OVRA: ovra };
  peers.forEach((p) => { bars[p.sym] = p.rows; });

  const evidenceEvent = {
    symbol: 'OVRA',
    shockDate,
    authoredAt: lastDate + 'T21:00:00.000Z',
    cause: { class: 'no-news', summary: 'Fixture: no company filing, guidance change or analyst action in the drop window.', publishedAt: null },
    thesisBreaking: false,
    revisions: { pctChange: -0.4, asOf: lastDate + 'T20:00:00.000Z' },
    justifiedMovePct: -1,
    credit: { confirms: false, note: 'Fixture: bond spread unchanged.' },
    contextBlocks: [],
    nextEarnings: null,
    sources: [{ publisher: 'Fixture source', url: 'https://example.com/overreaction-fixture', retrievedAt: lastDate + 'T20:30:00.000Z' }]
  };
  const evidence = { contractVersion: 'overreaction-evidence/v1', updated: lastDate + 'T21:00:00.000Z', events: [evidenceEvent] };
  return { bars, sectorMap, evidence, evidenceEvent, shockDate, lastDate, preShockClose: pre };
}
