/*
 * rloverreaction.js
 * ------------------------------------------------------------------------
 * Overreaction snap-back scanner — the single owner of the rules that decide
 * whether a large one-day DROP in a stock that was in a healthy uptrend is
 * "overblown" and likely to partly reverse, and whether that read is strong
 * enough to show.
 *
 * Rules follow the market-agent cheatsheet: K1 (large-mover detection),
 * K2 (overreaction flags and verdict), K3 (acting on a verdict) and the CS7
 * confidence rubric with the CS8 setup caps. Thresholds are conventions [C]
 * unless marked otherwise; they live in POLICY so a page never copies them.
 *
 * Honesty boundary. A browser can compute the tape, location and peer flags
 * from daily bars. It cannot know WHY a stock fell, whether analysts cut
 * estimates, or whether the company's bonds confirmed the drop. Those come
 * only from a sourced evidence record (data/overreaction/evidence.json,
 * validated by validateEvidence). Without one the verdict is "unclear" and the
 * candidate is never shown, because K2.3 requires the credit or revisions flag
 * for an "overblown" verdict and a missing input never counts as support.
 *
 * Pure compute: no fetch, no storage, no DOM. UMD — Node (module.exports) for
 * tests and scripts, browser global RLOVERREACTION for the swing lab.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) module.exports = api;
  if (typeof globalThis !== "undefined") globalThis.RLOVERREACTION = api;
})(function () {
  "use strict";

  var CONTRACT = "overreaction-scan/v1";
  var EVIDENCE_CONTRACT = "overreaction-evidence/v1";

  var POLICY = Object.freeze({
    lookbackSessions: 10,       // a shock stays scannable for the life of its setup (= expirySessions)
    sigmaWindow: 20,            // daily-return sigma window before the shock (K1)
    sigmaMultiple: 3,           // |residual| >= max(3 sigma, 5%) (K1)
    minMove: 0.05,
    minRvol: 2,                 // shock-day relative volume (K1)
    capitulationRvol: 3,        // K2 flag 5
    capitulationCloseLocation: 0.5, // close in the upper half of the shock-day range = reversal off the low
    betaWindow: 60,             // market adjustment regression window (K1 market-adjust)
    peerHalf: 0.5,              // K2 flag 6: peers moved less than half as much
    minPeers: 3,
    levelAtrTolerance: 0.25,    // K2 flag 8: low within 0.25 ATR of the level, closes held above it
    profileWindow: 126,
    holdSessions: 2,            // K3: holds above the day-1 low for 2 sessions
    gapMinimum: 0.02,           // K3 gap-midpoint reclaim needs a real gap
    stopAtr: 0.25,              // stop = day-1 low - 0.25 ATR
    targetRetrace: 0.5,         // T1 = half of the drop retraced (touch) [C]
    minRewardRisk: 2,           // CS2 T6
    expirySessions: 10,         // CS7 §2.1 Short default
    maxQuoteAgeMin: 20,         // during a live session an older price caps confidence at 6
    analogMinSample: 30,        // CS7 §1.3
    stressVix: 30,              // K3 regime filter
    showConfidence: 7,
    unearnedCap: 7
  });

  var CAUSE_CLASSES = Object.freeze(["fundamental-news", "no-news", "sympathy", "mechanical", "analyst-only", "thesis-breaking"]);
  var NON_FUNDAMENTAL_CAUSES = Object.freeze(["no-news", "sympathy", "mechanical", "analyst-only"]);
  var CONTEXT_BLOCKS = Object.freeze(["IR1", "IR2", "IR3", "IR7"]);
  /* Share classes of one issuer move together; one is scanned and neither counts as the other's peer
     (one setup per stock, CS5 §9.8). Secondary class -> primary class. */
  var SHARE_CLASS_PRIMARY = Object.freeze({ GOOG: "GOOGL", FOX: "FOXA", NWS: "NWSA", "BRK-A": "BRK-B" });
  function issuerOf(sym) { return SHARE_CLASS_PRIMARY[sym] || sym; }

  function isNum(x) { return typeof x === "number" && Number.isFinite(x); }
  function sessionDate(ms) { return isNum(ms) ? new Date(ms).toISOString().slice(0, 10) : null; }
  function mean(a) { if (!a.length) return null; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sd(a) { if (a.length < 2) return null; var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function median(a) { if (!a.length) return null; var b = a.slice().sort(function (x, y) { return x - y; }), k = b.length >> 1; return b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2; }
  function round(x, d) { if (!isNum(x)) return null; var p = Math.pow(10, d == null ? 4 : d); return Math.round(x * p) / p; }

  /* ── rows ─────────────────────────────────────────────────────────────── */

  function cleanRows(rows) {
    var out = [];
    (rows || []).forEach(function (r) {
      if (!r || !isNum(r.t) || !isNum(r.c) || r.c <= 0) return;
      out.push({ t: r.t, d: sessionDate(r.t), o: isNum(r.o) ? r.o : r.c, h: isNum(r.h) ? r.h : r.c, l: isNum(r.l) ? r.l : r.c, c: r.c, v: isNum(r.v) ? r.v : 0, live: !!r.live, asOf: r.asOf || null, progress: isNum(r.progress) ? r.progress : null });
    });
    out.sort(function (a, b) { return a.t - b.t; });
    return out;
  }

  /* Append the current-session quote (data/bars/live.json shape) as a forming bar when it is for a
     session after the last completed row. A price-only quote has no range or volume, so it is
     marked partial and can never be the shock bar (capitulation and RVOL would be invented). */
  function mergeLive(rows, quote, progress) {
    var base = cleanRows(rows);
    if (!quote || !isNum(quote.price) || !quote.sessionDate || !base.length) return base;
    var last = base[base.length - 1];
    if (!(quote.sessionDate > last.d)) return base;
    var partial = !(isNum(quote.open) && isNum(quote.high) && isNum(quote.low) && isNum(quote.volume));
    var t = Date.parse(quote.sessionDate + "T13:30:00Z");
    base.push({
      t: t, d: quote.sessionDate, o: isNum(quote.open) ? quote.open : quote.price,
      h: isNum(quote.high) ? Math.max(quote.high, quote.price) : quote.price, l: isNum(quote.low) ? Math.min(quote.low, quote.price) : quote.price,
      c: quote.price, v: isNum(quote.volume) ? quote.volume : 0,
      live: true, partial: partial, asOf: quote.asOf || null, src: quote.src || null, progress: isNum(progress) ? progress : null
    });
    return base;
  }

  /* Share of the regular session elapsed at `asOfMs` (0..1), for time-of-day adjusted volume. */
  function sessionProgress(asOfMs, startMs, endMs) {
    if (!isNum(asOfMs) || !isNum(startMs) || !isNum(endMs) || endMs <= startMs) return null;
    return Math.max(0, Math.min(1, (asOfMs - startMs) / (endMs - startMs)));
  }

  function byDate(rows) { var m = {}; rows.forEach(function (r, i) { m[r.d] = i; }); return m; }
  function retAt(rows, i) { return i > 0 && rows[i - 1].c > 0 ? rows[i].c / rows[i - 1].c - 1 : null; }

  function smaAt(rows, i, n) { if (i + 1 < n) return null; var s = 0; for (var k = i - n + 1; k <= i; k++) s += rows[k].c; return s / n; }
  function atrAt(rows, i, n) {
    n = n || 14; if (i < n) return null; var s = 0;
    for (var k = i - n + 1; k <= i; k++) { var pc = rows[k - 1].c; s += Math.max(rows[k].h - rows[k].l, Math.abs(rows[k].h - pc), Math.abs(rows[k].l - pc)); }
    return s / n;
  }

  /* Value-area low of a simple volume profile over `n` sessions ending at i (typical price, 50 bins, 70% value area). */
  function valueAreaLow(rows, i, n) {
    var lo = i - n + 1; if (lo < 0) return null;
    var hi = -Infinity, low = Infinity, k;
    for (k = lo; k <= i; k++) { if (rows[k].h > hi) hi = rows[k].h; if (rows[k].l < low) low = rows[k].l; }
    if (!(hi > low)) return null;
    var bins = 50, w = (hi - low) / bins, vol = new Array(bins).fill(0), total = 0;
    for (k = lo; k <= i; k++) { var tp = (rows[k].h + rows[k].l + rows[k].c) / 3, b = Math.min(bins - 1, Math.floor((tp - low) / w)); vol[b] += rows[k].v; total += rows[k].v; }
    if (!(total > 0)) return null;
    var poc = 0; for (k = 1; k < bins; k++) if (vol[k] > vol[poc]) poc = k;
    var a = poc, z = poc, acc = vol[poc];
    while (acc < total * 0.7 && (a > 0 || z < bins - 1)) {
      var down = a > 0 ? vol[a - 1] : -1, up = z < bins - 1 ? vol[z + 1] : -1;
      if (up >= down) { z++; acc += vol[z]; } else { a--; acc += vol[a]; }
    }
    return low + a * w;
  }

  function beta(rows, ref, refIdx, endIdx, n) {
    var xs = [], ys = [];
    for (var i = Math.max(1, endIdx - n + 1); i <= endIdx; i++) {
      var j = refIdx[rows[i].d], jp = refIdx[rows[i - 1].d];
      if (j == null || jp == null || j !== jp + 1) continue;
      var y = retAt(rows, i), x = ref[j].c / ref[jp].c - 1;
      if (isNum(x) && isNum(y)) { xs.push(x); ys.push(y); }
    }
    if (xs.length < 20) return null;
    var mx = mean(xs), my = mean(ys), cov = 0, vx = 0;
    for (var k = 0; k < xs.length; k++) { cov += (xs[k] - mx) * (ys[k] - my); vx += (xs[k] - mx) * (xs[k] - mx); }
    return vx > 0 ? cov / vx : null;
  }

  /* ── detection on one shock index ─────────────────────────────────────── */

  function shockAt(rows, s, ctx) {
    var P = POLICY, bar = rows[s];
    if (s < 260 || bar.partial) return null;
    var prev = rows[s - 1], move = bar.c / prev.c - 1;
    if (!(move < 0)) return null;
    var rets = []; for (var i = s - P.sigmaWindow; i < s; i++) { var r = retAt(rows, i); if (isNum(r)) rets.push(r); }
    var sigma = sd(rets); if (!isNum(sigma) || sigma <= 0) return null;
    var ref = ctx.sectorRows && ctx.sectorRows.length ? { rows: ctx.sectorRows, idx: ctx.sectorIdx, sym: ctx.sectorSym } : (ctx.benchRows && ctx.benchRows.length ? { rows: ctx.benchRows, idx: ctx.benchIdx, sym: ctx.benchSym } : null);
    var refMove = null, b = null, residual = move, adjusted = false;
    if (ref) {
      var j = ref.idx[bar.d], jp = ref.idx[prev.d];
      if (j != null && jp != null) {
        refMove = ref.rows[j].c / ref.rows[jp].c - 1;
        b = beta(rows, ref.rows, ref.idx, s - 1, P.betaWindow);
        if (isNum(b)) { residual = move - b * refMove; adjusted = true; }
      }
    }
    var threshold = Math.max(P.sigmaMultiple * sigma, P.minMove);
    if (!(residual <= -threshold)) return null;
    var vols = []; for (i = s - 20; i < s; i++) vols.push(rows[i].v);
    var avgVol = mean(vols);
    var progress = bar.live ? (isNum(bar.progress) ? Math.max(bar.progress, 0.1) : null) : 1;
    var rvol = avgVol > 0 && isNum(progress) ? bar.v / (avgVol * progress) : null;
    if (!(isNum(rvol) && rvol >= P.minRvol)) return null;
    return { s: s, move: move, residual: residual, sigma: sigma, threshold: threshold, rvol: rvol, rvolTimeAdjusted: !!bar.live, beta: b, refSym: ref ? ref.sym : null, refMove: refMove, marketAdjusted: adjusted };
  }

  /* The structural anchor (CS7 §3.1) is the LONG-term trend before the drop: a rising 200-day and
     positive 12-1 momentum [E: Moskowitz, Ooi & Pedersen 2012]. A stock already below its 200-day
     in a correction still qualifies; being above it is extra evidence (the "trend" family), not a gate. */
  function preTrend(rows, s) {
    var i = s - 1, sma200 = smaAt(rows, i, 200), sma200Prior = smaAt(rows, i - 20, 200);
    var mom = i >= 252 ? rows[i - 21].c / rows[i - 252].c - 1 : null;
    var ok = isNum(sma200) && isNum(sma200Prior) && isNum(mom) && sma200 > sma200Prior && mom > 0;
    return { ok: ok, aboveSma200: isNum(sma200) ? rows[i].c > sma200 : null, sma200Rising: isNum(sma200) && isNum(sma200Prior) ? sma200 > sma200Prior : null, momentum12_1: mom, sma200: sma200 };
  }

  /* K2 flags a browser can compute: 5 capitulation, 6 peers, 8 structural level held. */
  function mechanicalFlags(rows, s, shock, ctx) {
    var P = POLICY, bar = rows[s], range = bar.h - bar.l;
    var closeLocation = range > 0 ? (bar.c - bar.l) / range : null;
    var capitulation = isNum(shock.rvol) && shock.rvol >= P.capitulationRvol && isNum(closeLocation) && closeLocation >= P.capitulationCloseLocation;
    var peerMoves = [];
    (ctx.peers || []).forEach(function (p) {
      var j = p.idx[bar.d], jp = p.idx[rows[s - 1].d];
      if (j != null && jp != null && j === jp + 1) peerMoves.push(p.rows[j].c / p.rows[jp].c - 1);
    });
    var peerMedian = peerMoves.length >= P.minPeers ? median(peerMoves) : null;
    var peersCalm = isNum(peerMedian) ? Math.abs(peerMedian) < P.peerHalf * Math.abs(shock.move) : null;
    var atr = atrAt(rows, s - 1, 14), levels = [];
    var sma200 = smaAt(rows, s - 1, 200), val = valueAreaLow(rows, s - 1, P.profileWindow);
    if (isNum(sma200)) levels.push({ name: "200-day average", p: sma200 });
    if (isNum(val)) levels.push({ name: "6-month value-area low", p: val });
    var held = null;
    if (isNum(atr)) {
      levels.forEach(function (lv) {
        if (held) return;
        if (bar.l > lv.p + P.levelAtrTolerance * atr) return;
        for (var k = s; k < rows.length; k++) if (!rows[k].live && rows[k].c < lv.p) return;
        held = lv;
      });
    }
    return { closeLocation: closeLocation, capitulation: capitulation, peerCount: peerMoves.length, peerMedian: peerMedian, peersCalm: peersCalm, atr: atr, level: held, levelHeld: !!held };
  }

  /* K3 state and plan from the sessions after the shock. */
  function postShock(rows, s, atr) {
    var P = POLICY, bar = rows[s], prevClose = rows[s - 1].c, after = rows.slice(s + 1);
    var completed = after.filter(function (r) { return !r.live; }), latest = rows[rows.length - 1];
    var invalidated = completed.some(function (r) { return r.c < bar.l; });
    var holds = 0; for (var i = 0; i < completed.length; i++) { if (completed[i].l > bar.l) holds++; else break; }
    var gap = bar.o < prevClose * (1 - P.gapMinimum);
    var gapMid = gap ? (prevClose + bar.o) / 2 : null;
    var reclaimed = isNum(gapMid) && after.some(function (r) { return r.c >= gapMid; });
    var held = holds >= P.holdSessions;
    var sessionsSince = after.length;
    var stop = isNum(atr) ? bar.l - P.stopAtr * atr : null;
    var target = bar.l + P.targetRetrace * (prevClose - bar.l);
    var entry = latest.c;
    var rewardRisk = isNum(stop) && entry > stop ? (target - entry) / (entry - stop) : null;
    var state;
    if (invalidated) state = "invalidated";
    else if (latest.live && latest.c < bar.l) state = "below-day1-low";
    else if (entry >= target) state = "missed";
    else if (held || reclaimed) state = sessionsSince > P.expirySessions ? "expired" : "ready";
    else state = sessionsSince > P.expirySessions ? "expired" : "armed";
    return {
      state: state, trigger: held ? "held day-1 low " + P.holdSessions + " sessions" : reclaimed ? "reclaimed gap midpoint" : null,
      holds: holds, sessionsSince: sessionsSince, day1Low: bar.l, preShockClose: prevClose, gapMidpoint: gapMid,
      entry: entry, entryLive: !!latest.live, entryAsOf: latest.live ? latest.asOf : latest.d, stop: stop, target: target, rewardRisk: rewardRisk
    };
  }

  function prepCtx(input) {
    var sec = input.sectorRows ? cleanRows(input.sectorRows) : null, bench = input.benchRows ? cleanRows(input.benchRows) : null;
    return {
      sectorRows: sec, sectorIdx: sec ? byDate(sec) : null, sectorSym: input.sectorSym || null,
      benchRows: bench, benchIdx: bench ? byDate(bench) : null, benchSym: input.benchSym || "SPY",
      peers: (input.peers || []).map(function (p) { var r = cleanRows(p.rows); return { sym: p.sym, rows: r, idx: byDate(r) }; }).filter(function (p) { return p.rows.length; })
    };
  }

  /* Scan one symbol. Returns the latest qualifying shock in the lookback, or null. */
  function scanSymbol(input) {
    var rows = mergeLive(input.rows, input.live, input.liveProgress);
    if (rows.length < 262) return null;
    var ctx = prepCtx(input), best = null;
    for (var s = rows.length - 1; s >= Math.max(1, rows.length - POLICY.lookbackSessions); s--) {
      var shock = shockAt(rows, s, ctx);
      if (shock && (!best || shock.residual < best.residual)) best = shock;
    }
    if (!best) return null;
    var flags = mechanicalFlags(rows, best.s, best, ctx);
    return Object.freeze({
      contractVersion: CONTRACT, symbol: input.sym, sector: input.sectorSym || null, shockDate: rows[best.s].d, shockLive: !!rows[best.s].live,
      shock: best, trend: preTrend(rows, best.s), mechanical: flags, post: postShock(rows, best.s, flags.atr),
      lastDate: rows[rows.length - 1].d, lastLive: !!rows[rows.length - 1].live
    });
  }

  /* ── evidence ─────────────────────────────────────────────────────────── */

  function isIso(s) { return typeof s === "string" && isNum(Date.parse(s)); }
  function isDay(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && isNum(Date.parse(s + "T00:00:00Z")); }
  function numOrNull(x) { return x === null || isNum(x); }

  /* Validate data/overreaction/evidence.json. Every event must name its sources, and the cause
     must have been published no later than the shock session (anti-hindsight, CS7 §4.4). */
  function validateEvidence(doc) {
    var errors = [];
    function err(path, msg) { errors.push(path + ": " + msg); }
    if (!doc || typeof doc !== "object") return { ok: false, errors: ["document: not an object"] };
    if (doc.contractVersion !== EVIDENCE_CONTRACT) err("contractVersion", "must be " + EVIDENCE_CONTRACT);
    if (!isIso(doc.updated)) err("updated", "must be an ISO timestamp");
    if (!Array.isArray(doc.events)) { err("events", "must be an array"); return { ok: false, errors: errors }; }
    var seen = {};
    doc.events.forEach(function (e, i) {
      var p = "events[" + i + "]";
      if (!e || typeof e !== "object") { err(p, "not an object"); return; }
      if (typeof e.symbol !== "string" || !/^[A-Z0-9.\-^=]{1,12}$/.test(e.symbol)) err(p + ".symbol", "must be an upper-case ticker");
      if (!isDay(e.shockDate)) err(p + ".shockDate", "must be YYYY-MM-DD");
      var key = e.symbol + "@" + e.shockDate; if (seen[key]) err(p, "duplicate event " + key); seen[key] = 1;
      if (!isIso(e.authoredAt)) err(p + ".authoredAt", "must be an ISO timestamp");
      var c = e.cause;
      if (!c || CAUSE_CLASSES.indexOf(c.class) < 0) err(p + ".cause.class", "must be one of " + CAUSE_CLASSES.join(", "));
      else {
        if (typeof c.summary !== "string" || c.summary.trim().length < 12) err(p + ".cause.summary", "needs a one-sentence dated fact");
        if (c.class !== "no-news") {
          if (!isIso(c.publishedAt)) err(p + ".cause.publishedAt", "must be an ISO timestamp for a sourced cause");
          else if (isDay(e.shockDate) && Date.parse(c.publishedAt) > Date.parse(e.shockDate + "T23:59:59Z")) err(p + ".cause.publishedAt", "is after the shock session — a cause must precede the move");
        }
      }
      if (typeof e.thesisBreaking !== "boolean") err(p + ".thesisBreaking", "must be true or false");
      if (!e.revisions || !numOrNull(e.revisions.pctChange)) err(p + ".revisions.pctChange", "must be a number (percent) or null");
      else if (isNum(e.revisions.pctChange) && !isIso(e.revisions.asOf)) err(p + ".revisions.asOf", "required when pctChange is given");
      if (!numOrNull(e.justifiedMovePct === undefined ? null : e.justifiedMovePct)) err(p + ".justifiedMovePct", "must be a number (percent) or null");
      if (!e.credit || !(e.credit.confirms === null || typeof e.credit.confirms === "boolean")) err(p + ".credit.confirms", "must be true, false or null");
      if (!Array.isArray(e.contextBlocks) || e.contextBlocks.some(function (b) { return CONTEXT_BLOCKS.indexOf(b) < 0; })) err(p + ".contextBlocks", "must list only " + CONTEXT_BLOCKS.join(", "));
      if (!(e.nextEarnings === null || isDay(e.nextEarnings))) err(p + ".nextEarnings", "must be YYYY-MM-DD or null");
      if (!Array.isArray(e.sources) || !e.sources.length) err(p + ".sources", "at least one source is required");
      else e.sources.forEach(function (src, k) {
        var sp = p + ".sources[" + k + "]";
        if (!src || typeof src.publisher !== "string" || !src.publisher.trim()) err(sp + ".publisher", "required");
        if (!src || typeof src.url !== "string" || !/^https:\/\//.test(src.url)) err(sp + ".url", "must be an https URL");
        if (!src || !isIso(src.retrievedAt)) err(sp + ".retrievedAt", "must be an ISO timestamp");
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }

  function evidenceFor(doc, symbol, shockDate) {
    if (!doc || !Array.isArray(doc.events)) return null;
    for (var i = 0; i < doc.events.length; i++) { var e = doc.events[i]; if (e && e.symbol === symbol && e.shockDate === shockDate) return e; }
    return null;
  }

  /* ── verdict and confidence ───────────────────────────────────────────── */

  function addSessions(day, n) {
    // approximate trading-day horizon for the earnings check (weekends skipped, holidays not)
    var t = Date.parse(day + "T00:00:00Z"), added = 0;
    while (added < n) { t += 86400000; var w = new Date(t).getUTCDay(); if (w !== 0 && w !== 6) added++; }
    return sessionDate(t);
  }

  /* context: { spyAbove50: bool|null, vix: number|null, nowMs, sessionLive: bool, baseRate: analog result|null } */
  function evaluate(candidate, evidence, context) {
    var P = POLICY, ctx = context || {}, c = candidate, ev = evidence || null;
    var movePct = c.shock.move * 100, residualPct = c.shock.residual * 100, m = c.mechanical;
    var flags = [
      { id: 5, name: "capitulation volume with a reversal off the low", on: !!m.capitulation, family: "tape", source: "computed" },
      { id: 6, name: "peers moved less than half as much", on: m.peersCalm === true, family: "cross-section", source: "computed", unavailable: m.peersCalm === null },
      { id: 8, name: "held a major level on a closing basis", on: !!m.levelHeld, family: "location", source: "computed" }
    ];
    var verdict, why = [], blocks = [];
    if (!ev) {
      verdict = "unclear"; why.push("no sourced cause, revisions or credit check for this drop");
    } else {
      var cause = ev.cause && ev.cause.class;
      var nonFundamental = NON_FUNDAMENTAL_CAUSES.indexOf(cause) >= 0;
      var revs = ev.revisions && isNum(ev.revisions.pctChange) ? ev.revisions.pctChange : null;
      var justified = isNum(ev.justifiedMovePct) ? ev.justifiedMovePct : null;
      var ratio = isNum(justified) && justified < 0 ? residualPct / justified : null;
      flags.push({ id: 1, name: "move at least twice what fundamentals justify", on: (isNum(ratio) && Math.abs(ratio) >= 2) || (isNum(justified) && justified >= 0), family: "fundamentals", source: "evidence", unavailable: justified === null });
      flags.push({ id: 2, name: "cause is " + (cause || "unknown"), on: nonFundamental, family: "cause", source: "evidence" });
      flags.push({ id: 3, name: "credit did not confirm the drop", on: ev.credit && ev.credit.confirms === false, family: "credit", source: "evidence", unavailable: !ev.credit || ev.credit.confirms === null });
      flags.push({ id: 4, name: "estimates cut by less than half the price move", on: isNum(revs) && Math.abs(revs) < P.peerHalf * Math.abs(movePct), family: "fundamentals", source: "evidence", unavailable: revs === null });
      var count = flags.filter(function (f) { return f.on; }).length;
      var keyFlag = flags.some(function (f) { return (f.id === 3 || f.id === 4) && f.on; });
      if (ev.thesisBreaking || cause === "thesis-breaking") { verdict = "thesis-breaking"; blocks.push("thesis-breaking event — no reliable reversal (K2.1)"); }
      else if (ev.contextBlocks && ev.contextBlocks.length) { verdict = "unclear"; blocks.push("context rule " + ev.contextBlocks.join(", ") + " blocks an overblown call (K2.2)"); }
      else if (count >= 3 && keyFlag) verdict = "overblown";
      else if (isNum(ratio) && Math.abs(ratio) >= 0.5 && Math.abs(ratio) < 2 && isNum(revs) && revs < 0) verdict = "justified";
      else { verdict = "unclear"; why.push(count + " of 7 overreaction flags" + (keyFlag ? "" : ", and neither the credit nor the revisions flag")); }
      if (ev.nextEarnings && c.post && ev.nextEarnings <= addSessions(c.lastDate, P.expirySessions)) blocks.push("earnings " + ev.nextEarnings + " inside the holding window");
    }
    if (!c.trend.ok) blocks.push("no long-term uptrend before the drop (rising 200-day and positive 12-1 momentum)");
    if (["invalidated", "expired", "missed", "below-day1-low"].indexOf(c.post.state) >= 0) blocks.push("setup is " + c.post.state);
    if (c.post.state !== "invalidated" && isNum(c.post.rewardRisk) && c.post.rewardRisk < P.minRewardRisk) blocks.push("reward to stop " + round(c.post.rewardRisk, 2) + " below 2:1");
    if (!isNum(c.post.stop)) blocks.push("no ATR for a stop");

    // CS7 §1.2 arithmetic
    var steps = [{ label: "Start", delta: 0, total: 5 }], score = 5;
    function step(label, delta) { score += delta; steps.push({ label: label, delta: delta, total: score }); }
    var fams = {}; flags.forEach(function (f) { if (f.on) fams[f.family] = 1; });
    if (c.trend.ok && c.trend.aboveSma200) fams.trend = 1; // still above the 200-day before the drop (not a K2 flag)
    var famCount = Object.keys(fams).length;
    if (famCount > 1) step("Independent evidence families beyond the first: " + (famCount - 1) + (famCount - 1 > 3 ? ", counted up to 3" : "") + " (" + Object.keys(fams).join(", ") + ")", Math.min(3, famCount - 1));
    if (ev && NON_FUNDAMENTAL_CAUSES.indexOf(ev.cause && ev.cause.class) >= 0) step("[E] mechanism: moves without fundamental news partly reverse (Chan 2003; Da, Liu & Schaumburg 2014)", 1);
    if (c.post.state === "ready" && ctx.spyAbove50 === true) step("Market confirmation: trigger met and the S&P 500 is above its 50-day", 1);
    if (ev && ev.credit && ev.credit.confirms !== null && ev.revisions && isNum(ev.revisions.pctChange) && (!ev.contextBlocks || !ev.contextBlocks.length) && blocks.length === 0) step("Every channel checked (cause, revisions, credit, context) and none points against", 1);
    if (score > 10) step("Clipped to the 1-10 scale", 10 - score);
    score = Math.max(1, Math.min(10, score));
    var caps = [];
    function cap(n, why) { caps.push({ cap: n, why: why }); }
    cap(P.unearnedCap, "unearned: no resolved ledger outcomes for this setup (CS8 §5.3)");
    if (isNum(ctx.vix) && ctx.vix > P.stressVix) cap(6, "VIX " + round(ctx.vix, 1) + " above " + P.stressVix + ": buy-the-dip capped until stress-to-recovery (K3)");
    if (ctx.sessionLive) {
      var asOf = c.post.entryLive ? Date.parse(c.post.entryAsOf || "") : null;
      var age = isNum(asOf) && isNum(ctx.nowMs) ? (ctx.nowMs - asOf) / 60000 : null;
      if (!isNum(age)) cap(6, "market is open but the latest price is the prior close (no current-session quote)");
      else if (age > P.maxQuoteAgeMin) cap(6, "latest quote is " + Math.round(age) + " min old (limit " + P.maxQuoteAgeMin + ")");
    }
    var br = ctx.baseRate;
    if (br && br.n >= P.analogMinSample && isNum(br.rate) && isNum(br.breakeven) && br.rate < br.breakeven) cap(5, "mechanical analogs hit T1 " + Math.round(br.rate * 100) + "% vs breakeven " + Math.round(br.breakeven * 100) + "% (n=" + br.n + ")");
    var capped = caps.reduce(function (a, k) { return Math.min(a, k.cap); }, score);
    var show = verdict === "overblown" && capped >= P.showConfidence && blocks.length === 0 && (c.post.state === "ready" || c.post.state === "armed");
    return Object.freeze({
      verdict: verdict, why: why, blocks: blocks, flags: flags, confidence: capped, rawConfidence: score, steps: steps, caps: caps, show: show,
      // the drop passes every price-based gate and only the sourced record is missing — worth researching
      needsEvidence: !ev && blocks.length === 0 && (c.post.state === "ready" || c.post.state === "armed"),
      firstFailure: show ? null : (blocks[0] || (verdict !== "overblown" ? "verdict " + verdict : caps.filter(function (k) { return k.cap < P.showConfidence; }).map(function (k) { return k.why; })[0] || "confidence " + capped))
    });
  }

  /* ── mechanical base rate over history ─────────────────────────────────
     Same detection + anchor, then K3 hold-2-sessions entry at the second holding close, stop and T1
     as above, R:R >= 2. Hit = T1 touched before the stop within 10 sessions (a day that touches both
     counts as a loss). Cause is NOT checked — this is the price-only cohort, labelled as such. */
  function analogBaseRate(inputs, opts) {
    var P = POLICY, skipLast = (opts && opts.skipLast) || 15, n = 0, hits = 0, be = [];
    (inputs || []).forEach(function (input) {
      var rows = cleanRows(input.rows); if (rows.length < 280) return;
      var ctx = prepCtx(input);
      for (var s = 261; s < rows.length - skipLast; s++) {
        var shock = shockAt(rows, s, ctx); if (!shock || !preTrend(rows, s).ok) continue;
        var atr = atrAt(rows, s - 1, 14); if (!isNum(atr)) continue;
        var low = rows[s].l, e = s + P.holdSessions;
        if (e >= rows.length || !(rows[s + 1].l > low && rows[s + 2].l > low)) { s += P.holdSessions; continue; }
        var entry = rows[e].c, stop = low - P.stopAtr * atr, target = low + P.targetRetrace * (rows[s - 1].c - low);
        if (!(entry > stop) || (target - entry) / (entry - stop) < P.minRewardRisk) { s = e; continue; }
        var outcome = 0;
        for (var k = e + 1; k <= Math.min(rows.length - 1, e + P.expirySessions); k++) {
          if (rows[k].l <= stop) { outcome = -1; break; }
          if (rows[k].h >= target) { outcome = 1; break; }
        }
        n++; if (outcome === 1) hits++;
        be.push((entry - stop) / ((target - entry) + (entry - stop)));
        s = e + P.expirySessions;
      }
    });
    return Object.freeze({ n: n, hits: hits, rate: n ? hits / n : null, breakeven: be.length ? mean(be) : null, sufficient: n >= P.analogMinSample, cohort: "price-only (cause not checked)" });
  }

  /* Assemble inputs from a sector map and run the whole scan. The caller owns acquisition and hands
     in accessors, so the page (RLDATA cache + live quotes) and the CLI (committed files) run the same
     assembly. opts: { sectorMap, rowsFor(sym), quoteFor(sym), progressFor(quote), benchSym, nowMs,
     sessionLive, vix, evidence, baseRate (reuse a computed one; it ignores the live session) } */
  function scanUniverse(opts) {
    var o = opts || {}, benchSym = o.benchSym || "SPY", inputs = [], seen = {};
    function rowsWithLive(sym) { var q = o.quoteFor ? o.quoteFor(sym) : null; return mergeLive(o.rowsFor(sym) || [], q, o.progressFor ? o.progressFor(q) : null); }
    var bench = o.rowsFor(benchSym);
    Object.keys(o.sectorMap || {}).forEach(function (sectorSym) {
      var members = ((o.sectorMap[sectorSym] || {}).constituents || []).map(function (c) { return c && c.ticker; }).filter(Boolean);
      var sectorRows = rowsWithLive(sectorSym), peerRows = {};
      members.forEach(function (m) { peerRows[m] = rowsWithLive(m); });
      members.forEach(function (sym) {
        if (seen[sym]) return; seen[sym] = 1;
        if (issuerOf(sym) !== sym && members.indexOf(issuerOf(sym)) >= 0) return; // the primary class is scanned instead
        var rows = o.rowsFor(sym); if (!rows || !rows.length) return;
        var q = o.quoteFor ? o.quoteFor(sym) : null;
        inputs.push({ sym: sym, rows: rows, live: q, liveProgress: o.progressFor ? o.progressFor(q) : null, sectorSym: sectorSym, sectorRows: sectorRows, benchRows: bench, benchSym: benchSym,
          peers: members.filter(function (p) { return issuerOf(p) !== issuerOf(sym); }).map(function (p) { return { sym: p, rows: peerRows[p] }; }) });
      });
    });
    var baseRate = o.baseRate || analogBaseRate(inputs);
    var spy = rowsWithLive(benchSym), sma50 = null;
    if (spy.length >= 50) { var sum = 0; for (var i = spy.length - 50; i < spy.length; i++) sum += spy[i].c; sma50 = sum / 50; }
    var context = { spyAbove50: isNum(sma50) ? spy[spy.length - 1].c > sma50 : null, vix: isNum(o.vix) ? o.vix : null, nowMs: isNum(o.nowMs) ? o.nowMs : Date.now(), sessionLive: !!o.sessionLive, baseRate: baseRate };
    var results = [];
    inputs.forEach(function (input) {
      var cand = scanSymbol(input); if (!cand) return;
      var ev = evidenceFor(o.evidence, cand.symbol, cand.shockDate);
      results.push({ candidate: cand, evidence: ev, evaluation: evaluate(cand, ev, context) });
    });
    results.sort(function (a, b) { return (b.evaluation.show - a.evaluation.show) || (b.evaluation.confidence - a.evaluation.confidence) || (a.candidate.shock.residual - b.candidate.shock.residual); });
    return { scanned: inputs.length, baseRate: baseRate, context: context, results: results };
  }

  return {
    CONTRACT: CONTRACT, scanUniverse: scanUniverse, SHARE_CLASS_PRIMARY: SHARE_CLASS_PRIMARY, EVIDENCE_CONTRACT: EVIDENCE_CONTRACT, POLICY: POLICY, CAUSE_CLASSES: CAUSE_CLASSES, CONTEXT_BLOCKS: CONTEXT_BLOCKS,
    sessionDate: sessionDate, sessionProgress: sessionProgress, mergeLive: mergeLive, scanSymbol: scanSymbol,
    validateEvidence: validateEvidence, evidenceFor: evidenceFor, evaluate: evaluate, analogBaseRate: analogBaseRate,
    _internals: Object.freeze({ shockAt: shockAt, preTrend: preTrend, mechanicalFlags: mechanicalFlags, postShock: postShock, valueAreaLow: valueAreaLow, cleanRows: cleanRows })
  };
});
