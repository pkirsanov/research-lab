/* ═══════════ RLBRIEF — Actionable Market Brief components + pure helpers ═══════════
   Loaded by market-brief.html. Owns the four things the brief itself renders (attention
   feed, change-detection deltas, events/probabilities, watchlist roll-up); every "why"
   deep-links to the tool that owns it (see market-brief.config.json → deepLinks). Pure
   analytic helpers are `function` decls so scripts/selftest.mjs can extract + test them.
   Safe in Node (no-DOM guard). Educational only — not investment advice. */
(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : {});

  /* ── pure helpers (tested by selftest — keep as `function` decls) ── */

  /* map an rlg risk (-1/0/1) to a directional bias label. */
  function regimeBias(risk) { return risk > 0 ? "bull" : risk < 0 ? "bear" : "neutral"; }

  /* momentum acceleration from 5/21/63-day % momentum: compare short-horizon per-day
     pace vs long-horizon per-day pace. Positive => accelerating up, negative => decelerating. */
  function momentumAccel(m5, m21, m63) {
    var pd = [];
    if (isFinite(m5)) pd.push(m5 / 5);
    if (isFinite(m21)) pd.push(m21 / 21);
    if (isFinite(m63)) pd.push(m63 / 63);
    if (pd.length < 2) return { accel: 0, state: "n/a" };
    var accel = pd[0] - pd[pd.length - 1]; /* shortest per-day minus longest per-day */
    var state = accel > 0.03 ? "accelerating" : accel < -0.03 ? "decelerating" : "steady";
    return { accel: accel, state: state };
  }

  /* RRG quadrant from RS-Ratio (100 = benchmark) and RS-Momentum. */
  function rrgState(rsRatio, rsMom) {
    if (!isFinite(rsRatio) || !isFinite(rsMom)) return "n/a";
    if (rsRatio >= 100 && rsMom >= 0) return "Leading";
    if (rsRatio >= 100 && rsMom < 0) return "Weakening";
    if (rsRatio < 100 && rsMom < 0) return "Lagging";
    return "Improving";
  }

  /* is a name near a Leading↔Lagging rotation flip? (RS-Ratio within `z` of the 100 line). */
  function nearRotationFlip(rsRatio, z) {
    if (!isFinite(rsRatio)) return false;
    z = isFinite(z) ? z : 0.5;
    return Math.abs(rsRatio - 100) <= z;
  }

  /* clamp a probability vector to >=0 and normalize to sum 1; all-zero => uniform. */
  function normalizeProbs(arr) {
    if (!Array.isArray(arr) || !arr.length) return [];
    var cl = arr.map(function (x) { return (isFinite(x) && x > 0) ? x : 0; });
    var s = cl.reduce(function (a, b) { return a + b; }, 0);
    if (s <= 0) return cl.map(function () { return 1 / cl.length; });
    return cl.map(function (x) { return x / s; });
  }

  /* % distance of spot from a gamma flip (absolute). */
  function flipProximityPct(spot, flip) {
    if (!isFinite(spot) || !isFinite(flip) || flip === 0) return null;
    return Math.abs(spot / flip - 1) * 100;
  }

  /* rank attention cards by confidence × domain importance, capped to `max`. */
  function rankAttention(cards, max) {
    var W = { regime: 1.3, gamma: 1.2, rotation: 1.15, event: 1.1, momentum: 1.0, flows: 0.9 };
    var scored = (cards || []).map(function (c, i) {
      var w = W[c.domain] || 1, conf = isFinite(c.confidence) ? c.confidence : 50;
      return { c: c, k: conf * w, i: i };
    });
    scored.sort(function (a, b) { return (b.k - a.k) || (a.i - b.i); });
    var out = scored.map(function (s, idx) { s.c = Object.assign({}, s.c, { rank: idx + 1 }); return s.c; });
    return (max > 0) ? out.slice(0, max) : out;
  }

  /* directional arrow for a value vs its prior snapshot. */
  function deltaArrow(cur, prev, eps) {
    if (!isFinite(cur) || !isFinite(prev)) return "";
    eps = isFinite(eps) ? eps : 0;
    if (cur - prev > eps) return "\u2191";
    if (prev - cur > eps) return "\u2193";
    return "\u2192";
  }

  root.RLBRIEF = {
    regimeBias: regimeBias, momentumAccel: momentumAccel, rrgState: rrgState,
    nearRotationFlip: nearRotationFlip, normalizeProbs: normalizeProbs,
    flipProximityPct: flipProximityPct, rankAttention: rankAttention, deltaArrow: deltaArrow
  };

  if (typeof document === "undefined") return; /* Node (selftest) — stop before DOM renderers */

  /* ── DOM renderers ── */
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function pct(n, d) { return isFinite(n) ? (n >= 0 ? "+" : "") + n.toFixed(d == null ? 1 : d) + "%" : "—"; }
  function confPill(n) { var cls = n >= 70 ? "live" : n >= 45 ? "warn" : "bad"; return '<span class="pill ' + cls + '">conf ' + (isFinite(n) ? Math.round(n) : "—") + '</span>'; }
  function link(href, txt) { return href ? '<a class="dl" href="' + esc(href) + '">' + esc(txt || "open ▸") + '</a>' : ""; }
  function tkr(t, label) { try { if (typeof RLTKR !== "undefined") return RLTKR.tag(t, label ? { label: label } : undefined); } catch (e) { } var T = (t == null ? "" : String(t)).toUpperCase(); return T ? '<a class="rltkr" href="https://finance.yahoo.com/quote/' + esc(T) + '" target="_blank" rel="noopener" title="' + esc(T) + ' — Yahoo Finance">' + esc(label || T) + '</a>' : esc(label || ""); }

  function deepLink(cfg, key, ticker) {
    if (!cfg || !cfg.deepLinks) return "";
    if (ticker && cfg.deepLinks.stockModels && cfg.deepLinks.stockModels[ticker]) return cfg.deepLinks.stockModels[ticker];
    return cfg.deepLinks[key] || "";
  }

  function renderRegimeStrip(el, r) {
    if (!el) return;
    if (!r) { el.innerHTML = '<span class="pill">regime: (no payload yet)</span>'; return; }
    var vixCls = (r.vix && r.vix.level >= 26) ? "warn" : (r.vix && r.vix.level <= 15) ? "live" : "";
    var biasCls = r.bias === "bull" ? "live" : r.bias === "bear" ? "bad" : "warn";
    var fg = r.fearGreed || {}, vix = r.vix || {};
    var biasTip = "Directional bias from the shared rlg.js regime (Fear&Greed + VIX): bull = risk-on, bear = risk-off, neutral = two-sided.";
    var fgTip = "CNN Fear & Greed (0-100): >55 greed/risk-on, 45-55 neutral, <45 fear/risk-off." + (fg.band ? " Current: " + fg.band + "." : "");
    var vixTip = "CBOE implied volatility. <=15 calm (dealers long gamma, pins); 15-26 normal; >=26 stress / negative-gamma." + (vix.level != null ? " Current: " + vix.level + "." : "");
    el.innerHTML =
      '<span class="pill ' + biasCls + '" title="' + esc(biasTip) + '">' + esc((r.bias || "neutral").toUpperCase()) + (isFinite(r.score) ? " " + (r.score > 0 ? "+" : "") + r.score : "") + '</span>' +
      '<span class="pill" title="' + esc(fgTip) + '">F&amp;G ' + esc(fg.score != null ? fg.score : "—") + (fg.band ? " · " + esc(fg.band) : "") + (isFinite(fg.delta) && fg.delta ? " (" + (fg.delta > 0 ? "+" : "") + fg.delta + ")" : "") + '</span>' +
      '<span class="pill ' + vixCls + '" title="' + esc(vixTip) + '">VIX ' + esc(vix.level != null ? vix.level : "—") + (isFinite(vix.delta) && vix.delta ? " " + (vix.delta > 0 ? "▲" : "▼") : "") + (vix.term ? " · " + esc(vix.term) : "") + '</span>' +
      (r.note ? '<span class="sub" style="margin-left:6px">' + esc(r.note) + '</span>' : '');
  }

  function renderAttention(el, cards, cfg, max) {
    if (!el) return;
    var ranked = rankAttention(cards || [], max || 7);
    if (!ranked.length) { el.innerHTML = '<div class="sub">No attention items in the current payload.</div>'; return; }
    el.innerHTML = ranked.map(function (c) {
      var href = c.deepLink || deepLink(cfg, c.domain);
      return '<div class="acard ' + esc(c.domain || "") + '" data-tkr-auto title="Attention card — domain: ' + esc(c.domain || "") + '. Ranked by confidence × domain-importance; confidence = how much the evidence agrees, not a win-rate."><div class="ah"><span class="an">' + c.rank + '</span>' +
        '<b>' + esc(c.title || "") + '</b>' + confPill(c.confidence) + '</div>' +
        (c.what ? '<div class="aw">' + esc(c.what) + '</div>' : '') +
        (c.why ? '<div class="ay">' + esc(c.why) + '</div>' : '') +
        (href ? '<div class="al">' + link(href) + '</div>' : '') + '</div>';
    }).join("");
  }

  function renderRecs(el, recs, cfg) {
    if (!el) return;
    if (!recs || !recs.length) { el.innerHTML = '<div class="sub">No recommendations in the current payload.</div>'; return; }
    el.innerHTML = recs.map(function (r) {
      var href = r.deepLink || deepLink(cfg, "", r.subject);
      return '<div class="rec" data-tkr-auto title="Recommendation — action: ' + esc(r.action || "watch") + '. A reasoned lean; confidence = evidence agreement, not investment advice."><span class="act ' + esc((r.action || "watch")) + '">' + esc((r.action || "watch").toUpperCase()) + '</span>' +
        '<b>' + esc(r.subject || "") + '</b>' + confPill(r.confidence) +
        '<div class="ay">' + esc(r.rationale || "") + '</div>' + (href ? link(href) : "") + '</div>';
    }).join("");
  }

  function renderEvents(el, events) {
    if (!el) return;
    if (!events || !events.length) { el.innerHTML = '<div class="sub">No events in the current payload/config.</div>'; return; }
    var rows = events.map(function (e) {
      var scen = (e.scenarios || []).map(function (s) {
        var st = s.name + ": " + (isFinite(s.prob) ? Math.round(s.prob * 100) + "%" : "—") + (s.expectedEffect ? " — " + s.expectedEffect : "") + " (option-implied, psychology-adjusted estimate; not a guarantee)";
        return '<span class="scn" title="' + esc(st) + '">' + esc(s.name) + ' ' + (isFinite(s.prob) ? Math.round(s.prob * 100) + "%" : "—") + '</span>';
      }).join(" ");
      return '<tr><td>' + esc(e.when || "") + '</td><td data-tkr-auto><b>' + esc(e.event || e.type || "") + '</b>' +
        (e.ref ? ' ' + tkr(e.ref) : '') + '</td>' +
        '<td title="Option-implied 1-print move (ATM straddle) = the expected move priced by options for this event.">' + (isFinite(e.impliedMovePct) ? "±" + e.impliedMovePct.toFixed(1) + "%" : "—") + '</td>' +
        '<td>' + (scen || '<span class="sub">—</span>') + (e.psychologyNote ? '<div class="sub">' + esc(e.psychologyNote) + '</div>' : '') + '</td></tr>';
    }).join("");
    el.innerHTML = '<table class="evt"><thead><tr><th>When</th><th>Event</th><th>Implied</th><th>Scenarios · P · effect</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function renderWatchlist(el, items, cfg, notes) {
    if (!el) return;
    notes = notes || {};
    if (!items || !items.length) { el.innerHTML = '<div class="sub">Watchlist empty — add tickers.</div>'; return; }
    el.innerHTML = items.map(function (it) {
      var n = notes[it.ticker] || {}, href = it.model || n.deepLink || deepLink(cfg, "", it.ticker) || (cfg && cfg.deepLinks && cfg.deepLinks.momentum);
      return '<div class="wcard" data-tkr-auto title="Watchlist item — ' + esc(it.label || it.ticker) + '. Status = the current brief read; open the deep tool for the full analysis."><div class="wh"><b>' + tkr(it.ticker) + '</b><span class="pill">' + esc(it.type || "") + '</span>' +
        (it.model ? '<span class="pill live">model</span>' : '') + '</div>' +
        '<div class="wl">' + esc(it.label || "") + '</div>' +
        '<div class="ay">' + esc(n.status || "status card computed on live refresh") + '</div>' +
        (href ? link(href, it.model ? "deep model ▸" : "analyze ▸") : "") + '</div>';
    }).join("");
  }

  root.RLBRIEF.deepLink = deepLink;
  root.RLBRIEF.renderRegimeStrip = renderRegimeStrip;
  root.RLBRIEF.renderAttention = renderAttention;
  root.RLBRIEF.renderRecs = renderRecs;
  root.RLBRIEF.renderEvents = renderEvents;
  root.RLBRIEF.renderWatchlist = renderWatchlist;
})();
