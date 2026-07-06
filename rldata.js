/* ═══════════ RLDATA — shared cross-tool market-data cache (rlData) ═══════════
   One self-contained IIFE loaded by every Research Lab page that needs market data.
   Implements the contract in notes/shared-data-layer.md: a single schema-versioned
   localStorage object `rlData` so data fetched by one tool is REUSED by every other
   tool (APPEND, never refetch). Provider-tagged, interval-keyed, TTL-fresh, quota-aware.
   Also exposes ensure* fetch helpers (Yahoo v8 → public proxies → Twelve Data) that
   populate the cache on demand. Safe on file://, GitHub Pages, and Node (no-DOM guard).
   Educational only — not investment advice. */
(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : {});
  var HAS_LS = (function () { try { return (typeof localStorage !== "undefined") && !!localStorage; } catch (e) { return false; } })();
  var HAS_FETCH = (typeof fetch !== "undefined");

  /* ── pure helpers (extractable by scripts/selftest.mjs — keep as `function` decls) ── */

  /* merge two OHLCV arrays, dedupe by bar time `t`, ascending. Newer rows win on collision. */
  function mergeBars(oldRows, newRows) {
    var map = {}, i, r, out = [], keys;
    oldRows = Array.isArray(oldRows) ? oldRows : [];
    newRows = Array.isArray(newRows) ? newRows : [];
    for (i = 0; i < oldRows.length; i++) { r = oldRows[i]; if (r && isFinite(r.t)) map[r.t] = r; }
    for (i = 0; i < newRows.length; i++) { r = newRows[i]; if (r && isFinite(r.t)) map[r.t] = r; }
    keys = Object.keys(map).map(Number).sort(function (a, b) { return a - b; });
    for (i = 0; i < keys.length; i++) out.push(map[keys[i]]);
    return out;
  }

  /* freshness test: is a stored `at` epoch-ms within maxAgeMs of now? */
  function isFresh(at, maxAgeMs) { return !!(at && isFinite(at) && isFinite(maxAgeMs) && (Date.now() - at) <= maxAgeMs); }

  /* simple moving average of the last n closes (rows carry `.c`); null if insufficient. */
  function sma(rows, n) {
    if (!Array.isArray(rows) || !(n > 0) || rows.length < n) return null;
    var s = 0, i, r;
    for (i = rows.length - n; i < rows.length; i++) { r = rows[i]; if (!r || !isFinite(r.c)) return null; s += r.c; }
    return s / n;
  }

  /* trailing momentum in percent over `lookback` bars: last close vs the close `lookback` bars ago. */
  function momentumPct(rows, lookback) {
    if (!Array.isArray(rows) || !(lookback > 0) || rows.length < lookback + 1) return null;
    var a = rows[rows.length - 1], b = rows[rows.length - 1 - lookback];
    if (!a || !b || !isFinite(a.c) || !isFinite(b.c) || b.c === 0) return null;
    return (a.c / b.c - 1) * 100;
  }

  /* ── cache core ── */
  var SCHEMA = 1, KEY = "rlData", CAP_BYTES = 4 * 1024 * 1024;

  function load() {
    if (!HAS_LS) return { v: SCHEMA, bars: {}, quotes: {}, options: {}, si: {}, macro: null, events: {} };
    var d;
    try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { d = null; }
    if (!d || d.v !== SCHEMA) d = { v: SCHEMA, bars: {}, quotes: {}, options: {}, si: {}, macro: null, events: {} };
    d.bars = d.bars || {}; d.quotes = d.quotes || {}; d.options = d.options || {}; d.si = d.si || {}; d.events = d.events || {};
    return d;
  }
  function prune(d) {
    /* on quota, drop the oldest-`at` symbol bars bucket until under cap. */
    try {
      var syms = Object.keys(d.bars || {});
      syms.sort(function (a, b) { return oldestAt(d.bars[a]) - oldestAt(d.bars[b]); });
      while (syms.length && JSON.stringify(d).length > CAP_BYTES) { delete d.bars[syms.shift()]; }
    } catch (e) { }
  }
  function oldestAt(intervalMap) { var m = Infinity, k; for (k in intervalMap) { if (intervalMap[k] && intervalMap[k].at < m) m = intervalMap[k].at; } return isFinite(m) ? m : 0; }
  function save(d) {
    if (!HAS_LS) return;
    try { localStorage.setItem(KEY, JSON.stringify(d)); }
    catch (e) { prune(d); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e2) { } }
  }

  /* bars: interval-keyed, never cross-evicted; append-merge, provider-tagged. */
  function getBars(sym, interval, maxAgeH) {
    var d = load(), b = d.bars[sym] && d.bars[sym][interval];
    if (!b) return null;
    if (maxAgeH != null && !isFresh(b.at, maxAgeH * 3600e3)) return null;
    return b.rows;
  }
  function putBars(sym, interval, rows, src) {
    var d = load();
    d.bars[sym] = d.bars[sym] || {};
    var prev = d.bars[sym][interval];
    d.bars[sym][interval] = { at: Date.now(), src: src || (prev && prev.src) || "unknown", rows: mergeBars(prev && prev.rows, rows) };
    save(d); return d.bars[sym][interval].rows;
  }
  function getQuote(sym, maxAgeMin) { var d = load(), q = d.quotes[sym]; if (!q) return null; if (maxAgeMin != null && !isFresh(q.at, maxAgeMin * 60e3)) return null; return q; }
  function putQuote(sym, price, chgPct, src) { var d = load(); d.quotes[sym] = { at: Date.now(), price: price, chgPct: chgPct, src: src || "unknown" }; save(d); }

  /* options: our own rlData.options OR the options-lab legacy `optSnaps` store (read AS-IS; sign already applied). */
  function getOptions(sym, day) {
    var d = load(), o = d.options[sym];
    if (o) { if (day) return o[day] || null; var days = Object.keys(o).sort(); return days.length ? o[days[days.length - 1]] : null; }
    if (HAS_LS) { try { var legacy = JSON.parse(localStorage.getItem("optSnaps") || "null"); if (legacy && legacy[sym]) { var lk = Object.keys(legacy[sym]).sort(); return day ? (legacy[sym][day] || null) : (lk.length ? legacy[sym][lk[lk.length - 1]] : null); } } catch (e) { } }
    return null;
  }
  function putOptions(sym, day, snap) { var d = load(); d.options[sym] = d.options[sym] || {}; d.options[sym][day] = snap; save(d); }

  /* macro gauge — shape { at, fg:{score,band}, vix, vixTerm, breadth, pcRatio } — feeds RLG.macroRegime. */
  function getMacro(maxAgeMin) { var d = load(); if (!d.macro) return null; if (maxAgeMin != null && !isFresh(d.macro.at, maxAgeMin * 60e3)) return null; return d.macro; }
  function putMacro(obj) { var d = load(); d.macro = Object.assign({ at: Date.now() }, d.macro || {}, obj || {}); d.macro.at = Date.now(); save(d); return d.macro; }

  function getEvents(sym) { var d = load(); return (sym ? d.events[sym] : d.events) || null; }
  function putEvents(sym, obj) { var d = load(); d.events[sym] = Object.assign({ at: Date.now() }, obj || {}); save(d); }

  function freshness() {
    var d = load(), out = { macro: d.macro && d.macro.at || null, bars: {}, options: {} }, s, iv;
    for (s in d.bars) { out.bars[s] = {}; for (iv in d.bars[s]) out.bars[s][iv] = d.bars[s][iv].at; }
    for (s in d.options) { var ks = Object.keys(d.options[s]); out.options[s] = ks.length ? ks[ks.length - 1] : null; }
    return out;
  }

  /* ── fetch/ensure (browser only; Node callers use scripts/brief-refresh.mjs) ── */
  function rlGetKey(p) { try { var o = JSON.parse(localStorage.getItem("rlApiKeys") || "{}"); return ((o && o[p]) || "").trim(); } catch (e) { return ""; } }

  function proxied(url) {
    /* same free-proxy mechanism the other labs use: direct → corsproxy → allorigins → codetabs. */
    return [url,
      "https://corsproxy.io/?url=" + encodeURIComponent(url),
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
      "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(url)];
  }
  function fetchJson(url) {
    var chain = proxied(url), i = 0;
    return (function next() {
      if (i >= chain.length) return Promise.reject(new Error("all proxies failed"));
      return fetch(chain[i++]).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); }).catch(next);
    })();
  }
  function yahooToRows(j) {
    try {
      var res = j.chart.result[0], t = res.timestamp || [], q = res.indicators.quote[0],
        adj = res.indicators.adjclose && res.indicators.adjclose[0] && res.indicators.adjclose[0].adjclose, rows = [], i;
      for (i = 0; i < t.length; i++) {
        var c = adj ? adj[i] : q.close[i]; if (c == null) continue;
        rows.push({ t: t[i] * 1000, o: q.open[i], h: q.high[i], l: q.low[i], c: c, v: q.volume[i] });
      }
      return rows;
    } catch (e) { return null; }
  }
  function tdInterval(iv) { return iv === "1d" ? "1day" : iv === "5m" ? "5min" : iv === "1m" ? "1min" : "1day"; }
  function twelveDataBars(sym, interval) {
    var key = rlGetKey("twelvedata"); if (!key || !HAS_FETCH) return Promise.resolve(null);
    var url = "https://api.twelvedata.com/time_series?symbol=" + encodeURIComponent(sym) + "&interval=" + tdInterval(interval) + "&outputsize=1300&apikey=" + encodeURIComponent(key);
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.values || j.status === "error") return null;
      var rows = j.values.map(function (v) { var d = (v.datetime.indexOf(" ") >= 0) ? v.datetime.replace(" ", "T") + "Z" : v.datetime + "T00:00:00Z"; return { t: new Date(d).getTime(), o: +v.open, h: +v.high, l: +v.low, c: +v.close, v: +v.volume }; })
        .filter(function (x) { return isFinite(x.t) && isFinite(x.c); }).sort(function (a, b) { return a.t - b.t; });
      return rows.length ? rows : null;
    }).catch(function () { return null; });
  }
  function ensureBars(sym, interval, maxAgeH, range) {
    var cached = getBars(sym, interval, maxAgeH);
    if (cached) return Promise.resolve(cached);
    if (!HAS_FETCH) return Promise.resolve(getBars(sym, interval) || null);
    range = range || (interval === "1d" ? "5y" : interval === "5m" ? "1mo" : "7d");
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym) + "?range=" + range + "&interval=" + interval + "&includeAdjustedClose=true";
    return fetchJson(url).then(function (j) { var rows = yahooToRows(j); return (rows && rows.length) ? putBars(sym, interval, rows, "yahoo") : null; })
      .catch(function () { return null; })
      .then(function (res) { if (res) return res; return twelveDataBars(sym, interval).then(function (td) { return (td && td.length) ? putBars(sym, interval, td, "twelvedata") : (getBars(sym, interval) || null); }); });
  }
  function ensureMacro(maxAgeMin) {
    var cached = getMacro(maxAgeMin);
    if (cached) return Promise.resolve(cached);
    if (!HAS_FETCH) return Promise.resolve(getMacro() || null);
    var fgUrl = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";
    var vixUrl = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?range=1mo&interval=1d";
    return Promise.all([
      fetchJson(fgUrl).then(function (j) { try { return { score: Math.round(j.fear_and_greed.score), band: j.fear_and_greed.rating }; } catch (e) { return null; } }).catch(function () { return null; }),
      fetchJson(vixUrl).then(function (j) { var r = yahooToRows(j); return (r && r.length) ? r[r.length - 1].c : null; }).catch(function () { return null; })
    ]).then(function (res) {
      var fg = res[0], vix = res[1];
      if (fg == null && vix == null) return getMacro() || null;
      return putMacro({ fg: fg || undefined, vix: (vix != null ? vix : undefined) });
    });
  }

  root.RLDATA = {
    // accessors
    bars: getBars, putBars: putBars, quote: getQuote, putQuote: putQuote,
    options: getOptions, putOptions: putOptions, macro: getMacro, putMacro: putMacro,
    events: getEvents, putEvents: putEvents, freshness: freshness, rlGetKey: rlGetKey,
    // fetch/ensure
    ensureBars: ensureBars, ensureMacro: ensureMacro,
    // pure helpers (also used by selftest)
    mergeBars: mergeBars, isFresh: isFresh, sma: sma, momentumPct: momentumPct
  };
})();
