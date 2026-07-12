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

  /* Normalize the two historical recommendation shapes used by the payload. */
  function normalizeRecommendation(item) {
    item = item || {};
    return Object.assign({}, item, {
      action: item.action || item.direction || "watch",
      subject: item.subject || item.instrument || ""
    });
  }

  /* Immediately actionable next-session recommendations only. Watch-only ideas,
     missing triggers, and low-confidence observations stay out of the action block. */
  function nextSessionActions(recommendations, max, minConfidence) {
    var floor = isFinite(minConfidence) ? minConfidence : 55;
    var rows = (recommendations || []).map(normalizeRecommendation).filter(function (item) {
      return item.action !== "watch" && !!item.trigger && !!item.invalidation && !!item.structuralAnchor && isFinite(item.confidence) && item.confidence >= floor;
    });
    rows.sort(function (a, b) { return b.confidence - a.confidence; });
    return rows.slice(0, isFinite(max) && max > 0 ? max : 5);
  }

  /* Attention is still analysis, but the brief's visible feed is action-gated: it
     needs a structural anchor, adequate confidence, and cannot be labeled as mere
     watch/noise. Lower-confidence material belongs in owning tools, not the brief. */
  function actionableAttention(cards, minConfidence) {
    var floor = isFinite(minConfidence) ? minConfidence : 55;
    return (cards || []).filter(function (card) {
      var text = ((card && card.title) || "") + " " + ((card && card.what) || "");
      return card && !!card.structuralAnchor && isFinite(card.confidence) && card.confidence >= floor && !/\bwatch(?:list)?\b|intraday noise|not yet a trend/i.test(text);
    });
  }

  /* Keep the visible event slate focused on the next ~10 trading days (14 calendar
     days by default). Invalid/far-out dates remain in config/payload but not the cockpit. */
  function nearTermEvents(events, asOf, maxCalendarDays) {
    var base = Date.parse(asOf || ""), span = (isFinite(maxCalendarDays) ? maxCalendarDays : 14) * 864e5;
    if (!isFinite(base)) base = Date.now();
    return (events || []).filter(function (event) {
      var time = Date.parse(event && event.when); return isFinite(time) && time >= base - 864e5 && time <= base + span;
    }).sort(function (a, b) { return Date.parse(a.when) - Date.parse(b.when); });
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

  /* ── §6c larger-picture / anti-reactivity helpers (pure, tested) ── */

  /* stacked-MA trend label from the 20/50/200 SMAs (the PRIMARY structural frame):
     bull-stack = 20>50>200, bear-stack = 20<50<200, else tangled. */
  function maStackLabel(ma20, ma50, ma200) {
    if (![ma20, ma50, ma200].every(function (x) { return isFinite(x); })) return "n/a";
    if (ma20 > ma50 && ma50 > ma200) return "bull-stack";
    if (ma20 < ma50 && ma50 < ma200) return "bear-stack";
    return "tangled";
  }

  /* signed % distance of a price from a level (MA / high / support): + above, - below. */
  function pctFromLevel(price, level) {
    if (!isFinite(price) || !isFinite(level) || level === 0) return null;
    return (price / level - 1) * 100;
  }

  /* §6c anti-reactivity cap: a tactical-horizon (single-session) read is capped at `cap`
     confidence so an intraday wiggle can never look as strong as a structural signal. */
  function capConfidence(conf, horizon, cap) {
    var c = isFinite(conf) ? conf : 50, k = isFinite(cap) ? cap : 55;
    return (horizon === "tactical" && c > k) ? k : c;
  }

  /* the tail consecutive same-direction run in a series (oldest→newest), beyond eps.
     Returns { dir:-1|0|1, len }. The persistence gate (§5/§6c) uses this so a momentum
     micro-delta must persist across snapshots before it becomes an action. */
  function consecutiveRun(values, eps) {
    if (!Array.isArray(values) || values.length < 2) return { dir: 0, len: 0 };
    eps = isFinite(eps) ? eps : 0;
    var dir = 0, len = 0;
    for (var i = values.length - 1; i > 0; i--) {
      var d = values[i] - values[i - 1], s = d > eps ? 1 : d < -eps ? -1 : 0;
      if (s === 0) break;
      if (dir === 0) dir = s; else if (s !== dir) break;
      len++;
    }
    return { dir: dir, len: len };
  }

  /* is a momentum/RS delta a persistent SIGNAL (not intraday noise)? True when the tail
     run is ≥ minRun snapshots in one direction (the §6c persistence gate). */
  function isPersistentSignal(values, minRun, eps) {
    var r = consecutiveRun(values, eps);
    return r.dir !== 0 && r.len >= (isFinite(minRun) ? minRun : 2);
  }

  /* ── §7a mega-cap / thematic group helpers (pure, tested) ── */

  /* normalize a group's members (an object map keyed by ticker OR an array with an embedded
     ticker) into a uniform array of member-read objects each carrying a `ticker`. */
  function memberArray(members) {
    if (Array.isArray(members)) return members;
    if (members && typeof members === "object") {
      return Object.keys(members).map(function (k) {
        var m = members[k];
        return (m && typeof m === "object") ? Object.assign({ ticker: k }, m) : { ticker: k, value: m };
      });
    }
    return [];
  }

  /* group breadth from member reads: how many of N members are individually bull-stacked /
     above their 50- and 200-day / positive on 21-day momentum, plus a compact label. */
  function groupBreadth(members) {
    var arr = memberArray(members), n = 0, bull = 0, a50 = 0, a200 = 0, up = 0;
    for (var i = 0; i < arr.length; i++) {
      var m = arr[i] || {}; n++;
      if (m.maStack === "bull-stack") bull++;
      if (isFinite(m.ma50Dist) && m.ma50Dist > 0) a50++;
      if (isFinite(m.ma200Dist) && m.ma200Dist > 0) a200++;
      if (isFinite(m.mom21) && m.mom21 > 0) up++;
    }
    return { n: n, bullStacked: bull, above50: a50, above200: a200, upMom: up, label: n ? bull + "/" + n + " bull-stacked" : "n/a" };
  }

  /* pick the NOTABLE members of a group for THIS run (§7a): a member is notable when its move
     clears `minMovePct` (|21d| or |5d|) OR it structurally diverges from the group (bear-stack,
     or below its 200-day). Sorted by move magnitude (ties keep input order), capped to `max`. */
  function notableMembers(members, opts) {
    var arr = memberArray(members);
    var minMove = (opts && isFinite(opts.minMovePct)) ? opts.minMovePct : 3;
    var max = (opts && isFinite(opts.max)) ? opts.max : 4;
    var scored = [];
    for (var i = 0; i < arr.length; i++) {
      var m = arr[i] || {};
      var a21 = isFinite(m.mom21) ? Math.abs(m.mom21) : 0;
      var a5 = isFinite(m.mom5) ? Math.abs(m.mom5) : 0;
      var score = a21 > a5 ? a21 : a5;
      var bear = m.maStack === "bear-stack";
      var below200 = isFinite(m.ma200Dist) && m.ma200Dist < 0;
      if (score < minMove && !bear && !below200) continue;
      var reasons = [];
      if (score >= minMove) reasons.push((isFinite(m.mom21) && m.mom21 < 0) ? "big decliner" : "big mover");
      if (bear) reasons.push("bear-stack"); else if (below200) reasons.push("below 200d");
      scored.push({ item: { ticker: m.ticker || null, mom5: isFinite(m.mom5) ? m.mom5 : null, mom21: isFinite(m.mom21) ? m.mom21 : null, maStack: m.maStack || null, ma200Dist: isFinite(m.ma200Dist) ? m.ma200Dist : null, score: Math.round(score * 100) / 100, reason: reasons.join(", ") }, k: score, i: i });
    }
    scored.sort(function (a, b) { return (b.k - a.k) || (a.i - b.i); });
    return scored.slice(0, max).map(function (s) { return s.item; });
  }

  root.RLBRIEF = {
    regimeBias: regimeBias, momentumAccel: momentumAccel, rrgState: rrgState,
    nearRotationFlip: nearRotationFlip, normalizeProbs: normalizeProbs,
    flipProximityPct: flipProximityPct, rankAttention: rankAttention, deltaArrow: deltaArrow,
    maStackLabel: maStackLabel, pctFromLevel: pctFromLevel, capConfidence: capConfidence,
    consecutiveRun: consecutiveRun, isPersistentSignal: isPersistentSignal,
    memberArray: memberArray, groupBreadth: groupBreadth, notableMembers: notableMembers,
    normalizeRecommendation: normalizeRecommendation, nextSessionActions: nextSessionActions,
    actionableAttention: actionableAttention, nearTermEvents: nearTermEvents
  };

  if (typeof document === "undefined") return; /* Node (selftest) — stop before DOM renderers */

  /* ── DOM renderers ── */
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function pct(n, d) { return Number.isFinite(n) ? (n >= 0 ? "+" : "") + n.toFixed(d == null ? 1 : d) + "%" : "—"; }
  function confPill(n) { var cls = n >= 70 ? "live" : n >= 45 ? "warn" : "bad"; return '<span class="pill ' + cls + '">conf ' + (Number.isFinite(n) ? Math.round(n) : "—") + '</span>'; }
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
    var cap = (cfg && cfg.thresholds && cfg.thresholds.tacticalConfidenceCap) || 55;
    el.innerHTML = ranked.map(function (c) {
      var href = c.deepLink || deepLink(cfg, c.domain);
      var conf = capConfidence(c.confidence, c.horizon, cap);
      return '<div class="acard ' + esc(c.domain || "") + '" data-tkr-auto title="Attention card — domain: ' + esc(c.domain || "") + '. Ranked by confidence × domain-importance; confidence = how much the evidence agrees, not a win-rate."><div class="ah"><span class="an">' + c.rank + '</span>' +
        '<b>' + esc(c.title || "") + '</b>' + horizonPill(c.horizon) + confPill(conf) + '</div>' +
        (c.what ? '<div class="aw">' + esc(c.what) + '</div>' : '') +
        (c.why ? '<div class="ay">' + esc(c.why) + '</div>' : '') +
        (c.structuralAnchor ? '<div class="anchor" title="The structural anchor (§6c): the MA / level / trend this read rests on — so a tactical card never floats free of the larger frame.">\u2693 ' + esc(c.structuralAnchor) + '</div>' : '') +
        (href ? '<div class="al">' + link(href) + '</div>' : '') + '</div>';
    }).join("");
  }

  function renderRecs(el, recs, cfg) {
    if (!el) return;
    if (!recs || !recs.length) { el.innerHTML = '<div class="sub">No recommendations in the current payload.</div>'; return; }
    var cap = (cfg && cfg.thresholds && cfg.thresholds.tacticalConfidenceCap) || 55;
    el.innerHTML = recs.map(function (raw) {
      var r = normalizeRecommendation(raw);
      var href = r.deepLink || deepLink(cfg, "", r.subject);
      var conf = capConfidence(r.confidence, r.horizon, cap);
      return '<div class="rec" data-tkr-auto title="Recommendation — action: ' + esc(r.action || "watch") + '. A reasoned lean; confidence = evidence agreement, not investment advice."><span class="act ' + esc((r.action || "watch")) + '">' + esc((r.action || "watch").toUpperCase()) + '</span>' +
        '<b>' + esc(r.subject || "") + '</b>' + horizonPill(r.horizon) + confPill(conf) +
        '<div class="ay">' + esc(r.rationale || "") + '</div>' +
        (r.structuralAnchor ? '<div class="anchor" title="The structural anchor (§6c): the MA / level / trend this rec rests on.">\u2693 ' + esc(r.structuralAnchor) + '</div>' : '') +
        ((r.trigger || r.invalidation) ? '<div class="trig">' + (r.trigger ? '<span class="tg ok" title="The trigger: the level or CONFIRMED cross that ACTS on this rec.">\u25b8 trigger: ' + esc(r.trigger) + '</span>' : '') + (r.invalidation ? '<span class="tg no" title="The invalidation: what falsifies this rec — the structural line that says the thesis is wrong.">\u2715 invalidation: ' + esc(r.invalidation) + '</span>' : '') + '</div>' : '') +
        (href ? link(href) : "") + '</div>';
    }).join("");
  }

  function renderNextSession(el, nextSession, recs, cfg, snap) {
    if (!el) return;
    var thresholds = (cfg && cfg.thresholds) || {};
    var actions = nextSession && Array.isArray(nextSession.actions) ? nextSession.actions.map(normalizeRecommendation) : nextSessionActions(recs || [], thresholds.nextSessionMaxActions || 5, thresholds.minimumActionConfidence || 55);
    var sessionDate = (nextSession && nextSession.sessionDate) || (snap && snap.nextSessionDate) || "next trading session";
    var thesis = nextSession && nextSession.thesis;
    if (!actions.length) {
      el.innerHTML = '<div class="sub">No recommendation clears the immediate-action bar for ' + esc(sessionDate) + '. Keep the current plan; use the owning tools for watch-only setups.</div>';
      return;
    }
    var host = document.createElement("div");
    renderRecs(host, actions, cfg);
    el.innerHTML = '<div class="next-head"><b>' + esc(sessionDate) + '</b>' + ((snap && snap.marketClosed) ? ' <span class="pill warn">latest completed bars</span>' : '') + (thesis ? '<span class="sub">' + esc(thesis) + '</span>' : '') + '</div><div class="grid2">' + host.innerHTML + '</div>';
  }

  function renderToolReads(el, tools, snapshotReads, localReads) {
    if (!el) return;
    snapshotReads = snapshotReads || {}; localReads = localReads || {};
    var available = [], missing = [];
    (tools || []).forEach(function (tool) {
      if (!tool || tool.id === "market-brief") return;
      var read = localReads[tool.id] || snapshotReads[tool.id];
      if (read && read.read) available.push({ tool: tool, value: read, live: !!localReads[tool.id] });
      else missing.push(tool);
    });
    var rows = available.map(function (row) {
      var tool = row.tool, value = row.value, href = value.deepLink || tool.file || "";
      var freshness = value.asOf ? fmtToolReadAge(value.asOf) : "as-of unknown";
      return '<div class="toolread" data-tkr-auto title="Latest Simple-view read from the owning tool; open it for model controls and full diagnostics."><div><b>' + esc(tool.title || tool.id) + '</b> <span class="pill ' + (row.live ? 'live' : '') + '">' + (row.live ? 'browser' : 'Tier-A') + '</span></div><div class="ay">' + esc(value.read) + '</div><div class="sub">' + esc(freshness) + (href ? ' · ' + link(href, 'open tool ▸') : '') + '</div></div>';
    }).join("");
    el.innerHTML = '<div class="sub" style="margin-bottom:8px">' + available.length + ' owning-tool reads available · ' + missing.length + ' require an agent/browser read. Missing tools are explicit, never silently treated as neutral.</div>' + (rows || '<div class="sub">No owning-tool reads are available yet.</div>') + (missing.length ? '<div class="sub" style="margin-top:8px">Awaiting: ' + missing.map(function (tool) { return esc(tool.title || tool.id); }).join(', ') + '</div>' : '');
  }
  function fmtToolReadAge(iso) {
    var time = Date.parse(iso); if (!isFinite(time)) return String(iso || "as-of unknown");
    var hours = Math.max(0, (Date.now() - time) / 36e5);
    return hours < 1 ? "as of <1h ago" : hours < 24 ? "as of " + Math.round(hours) + "h ago" : "as of " + Math.round(hours / 24) + "d ago";
  }

  function renderEvents(el, events) {
    if (!el) return;
    if (!events || !events.length) { el.innerHTML = '<div class="sub">No events in the current payload/config.</div>'; return; }
    var rows = events.map(function (e) {
      var scen = (e.scenarios || []).map(function (s) {
        var st = s.name + ": " + (Number.isFinite(s.prob) ? Math.round(s.prob * 100) + "%" : "—") + (s.expectedEffect ? " — " + s.expectedEffect : "") + " (option-implied, psychology-adjusted estimate; not a guarantee)";
        return '<span class="scn" title="' + esc(st) + '">' + esc(s.name) + ' ' + (Number.isFinite(s.prob) ? Math.round(s.prob * 100) + "%" : "—") + '</span>';
      }).join(" ");
      return '<tr><td>' + esc(e.when || "") + '</td><td data-tkr-auto><b>' + esc(e.event || e.type || "") + '</b>' +
        (e.ref ? ' ' + tkr(e.ref) : '') + '</td>' +
        '<td title="Option-implied 1-print move (ATM straddle) = the expected move priced by options for this event.">' + (Number.isFinite(e.impliedMovePct) ? "±" + e.impliedMovePct.toFixed(1) + "%" : "—") + '</td>' +
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

  /* the mega-cap / thematic group roll-up (§7a): per group, the ETF-proxy read (RRG + MA
     stack + relative-strength) + internal breadth + the NOTABLE members worth watching this
     run. Reads PAYLOAD.groups (agent-annotated) OR SNAP.groups (Tier-A deterministic); deep-
     links the rotation lab that owns the basket. */
  function renderGroups(el, groups, cfg) {
    if (!el) return;
    if (!groups || !groups.length) { el.innerHTML = '<div class="sub">No mega-cap / thematic group data yet — the Tier-A refresh (brief-refresh.mjs) computes the MAGS (Mag 7) + SOXX (semis) group read + breadth, and the agent run elevates the notable members.</div>'; return; }
    var th = (cfg && cfg.thresholds) || {};
    var minMove = isFinite(th.notableMemberMinMovePct) ? th.notableMemberMinMovePct : 3;
    var maxN = isFinite(th.notableMemberMaxCount) ? th.notableMemberMaxCount : 4;
    el.innerHTML = groups.map(function (g) {
      var read = g.read || {};
      var br = g.breadth || groupBreadth(g.members);
      var notable = (g.notable && g.notable.length) ? g.notable : notableMembers(g.members, { minMovePct: minMove, max: maxN });
      var href = g.deepLink || (cfg && cfg.deepLinks && (cfg.deepLinks.megacaps || cfg.deepLinks.rotation)) || "";
      var rrg = read.rrgState || "n/a", stack = read.maStack || "n/a";
      var rrgCls = /^(Leading|Basing|Improving)/.test(rrg) ? "live" : /^Lagging/.test(rrg) ? "bad" : /^(Weakening|Peaking)/.test(rrg) ? "warn" : "";
      var stackCls = stack === "bull-stack" ? "live" : stack === "bear-stack" ? "bad" : "";
      var brCls = (br.n && br.bullStacked >= Math.ceil(br.n * 0.6)) ? "live" : (br.n && br.bullStacked <= Math.floor(br.n * 0.3)) ? "bad" : "warn";
      var rsBits = [];
      if (isFinite(read.rsMom1m)) rsBits.push("1m RS " + (read.rsMom1m > 0 ? "+" : "") + read.rsMom1m);
      if (isFinite(read.rsMom3m)) rsBits.push("3m " + (read.rsMom3m > 0 ? "+" : "") + read.rsMom3m);
      if (isFinite(read.ma200Dist)) rsBits.push("200d " + (read.ma200Dist > 0 ? "+" : "") + read.ma200Dist + "%");
      var chips = (notable || []).map(function (m) {
        var mv = isFinite(m.mom21) ? ((m.mom21 > 0 ? "+" : "") + m.mom21 + "%") : "\u2014";
        var tip = (m.ticker || "") + " \u2014 21-day momentum " + mv + (m.reason ? " \u00b7 " + m.reason : "") + (isFinite(m.ma200Dist) ? " \u00b7 " + (m.ma200Dist > 0 ? "+" : "") + m.ma200Dist + "% vs its 200-day" : "");
        var cls = isFinite(m.mom21) ? (m.mom21 > 0 ? "up" : "down") : "";
        return '<span class="gm ' + cls + '" title="' + esc(tip) + '">' + tkr(m.ticker) + ' <span class="gmv">' + esc(mv) + '</span></span>';
      }).join("");
      return '<div class="gcard" data-tkr-auto title="Thematic group roll-up — the group read (leading/lagging + MA stack + breadth) plus the NOTABLE members worth watching this run. Anchored structure-first (§6c); a one-window member wiggle is not a trend.">' +
        '<div class="gh"><b>' + esc(g.label || g.id || "") + '</b>' + (g.etf ? " " + tkr(g.etf) : "") +
        '<span class="pill ' + rrgCls + '" title="Relative-rotation state of the group ETF vs SPY (RRG + 2-week momentum acceleration, matching the sector-rotation tool): Leading / Weakening \u2193 / Lagging / Improving \u2191, plus early-turn Basing \u2191 (lagging but accelerating) and Peaking \u26a0 (leading but rolling over).">' + esc(rrg) + '</span>' +
        '<span class="pill ' + stackCls + '" title="20/50/200-day moving-average structure of the group ETF: bull-stack (20&gt;50&gt;200), bear-stack, or tangled.">' + esc(stack) + '</span>' +
        '<span class="pill ' + brCls + '" title="Group breadth: how many members are individually bull-stacked (20&gt;50&gt;200) — the internal health behind the ETF-level read.">' + esc(br.label || (br.bullStacked + "/" + br.n)) + '</span></div>' +
        (rsBits.length ? '<div class="sub grs">' + esc(rsBits.join(" \u00b7 ")) + '</div>' : "") +
        (chips ? '<div class="gmembers">' + chips + '</div>' : '<div class="sub">No members clear the notable-move bar this run.</div>') +
        (g.note ? '<div class="ay">' + esc(g.note) + '</div>' : "") +
        (href ? '<div class="al">' + link(href, "rotation detail \u25b8") + '</div>' : "") +
        '</div>';
    }).join("");
  }

  root.RLBRIEF.deepLink = deepLink;
  root.RLBRIEF.renderRegimeStrip = renderRegimeStrip;
  root.RLBRIEF.renderBackdrop = renderBackdrop;
  root.RLBRIEF.renderAttention = renderAttention;
  root.RLBRIEF.renderRecs = renderRecs;
  root.RLBRIEF.renderNextSession = renderNextSession;
  root.RLBRIEF.renderToolReads = renderToolReads;
  root.RLBRIEF.renderEvents = renderEvents;
  root.RLBRIEF.renderWatchlist = renderWatchlist;
  root.RLBRIEF.renderGroups = renderGroups;

  /* horizon pill (structural / swing / tactical) — the §6c frame label. */
  function horizonPill(h) {
    if (!h) return "";
    var cls = h === "structural" ? "live" : h === "swing" ? "warn" : "";
    var tip = h === "structural" ? "Structural horizon (weeks–months): anchored to the 20/50/200-day trend — the primary frame."
      : h === "swing" ? "Swing horizon (days–weeks): 21/63-day momentum, RRG trajectory, support/resistance."
        : "Tactical horizon (this session): the intraday tape — it TUNES, never SETS, the view; confidence is capped (§6c).";
    return '<span class="pill hz ' + cls + '" title="' + esc(tip) + '">' + esc(h) + '</span>';
  }

  /* the standing big-picture backdrop (§6c) — renders at the TOP of the cockpit so the
     larger frame (primary trend, macro cycle, global tensions, what's priced in) is read
     BEFORE any tactical card. */
  function renderBackdrop(el, b) {
    if (!el) return;
    if (!b) { el.innerHTML = '<div class="sub">No structural backdrop in the current payload — the larger-picture frame (primary trend, macro cycle, global tensions, what\u2019s priced in) is authored by the agent run (see the runbook \u00a76c).</div>'; return; }
    function list(items) {
      if (!items || !items.length) return "";
      return '<ul class="bd-list">' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>';
    }
    function block(title, tip, inner) { return inner ? '<div class="bd-block"><div class="bd-h" title="' + esc(tip) + '">' + esc(title) + '</div>' + inner + '</div>' : ""; }
    var levels = "";
    if (b.structuralLevels && typeof b.structuralLevels === "object") {
      var keys = Object.keys(b.structuralLevels);
      if (keys.length) levels = block("Structural levels", "Key horizontal support / resistance + the 50/200-day moving averages per instrument — the levels every read is anchored to (\u00a76c). Re-pull live if stale.",
        keys.map(function (k) {
          var lv = b.structuralLevels[k] || {}, bits = [];
          if (lv.resistance && lv.resistance.length) bits.push("R " + esc(lv.resistance.join(", ")));
          if (isFinite(lv.ma50)) bits.push("50d " + lv.ma50);
          if (isFinite(lv.ma200)) bits.push("200d " + lv.ma200);
          if (lv.support && lv.support.length) bits.push("S " + esc(lv.support.join(", ")));
          return '<div class="bd-lv"><b>' + tkr(k) + '</b> <span class="sub">' + bits.join(" \u00b7 ") + (lv.note ? " \u2014 " + esc(lv.note) : "") + '</span></div>';
        }).join(""));
    }
    el.innerHTML =
      '<div class="bd-primary" title="The PRIMARY structural frame (\u00a76c): the market regime, where we are in the cycle (early/mid/late/topping/bottoming), and the 20/50/200-day MA structure. Everything else is read INSIDE this frame.">' + esc(b.primaryTrend || "\u2014") + '</div>' +
      block("Trend evidence", "The evidence for the primary trend — MA stack, 200-day slope, 52-week-range position, 126/252-day momentum. Labeled; re-pull live where stale.", list(b.trendEvidence)) +
      block("Macro cycle", "The macro CYCLE direction (not the next print): central-bank path + what the curve prices, rates trend, USD, credit, liquidity.", b.macroCycle ? '<div class="bd-t">' + esc(b.macroCycle) + '</div>' : "") +
      block("Global backdrop & geopolitics", "Standing global / geopolitical tensions and their CURRENT market impact — war-risk, trade & tariffs, elections, China, energy, JPY-carry. Verified each run; never fabricated.", list(b.globalBackdrop)) +
      block("What\u2019s priced in", "What consensus + options/positioning ALREADY price (rate path, earnings growth, vol regime) — the bar reality has to clear.", b.pricedIn ? '<div class="bd-t">' + esc(b.pricedIn) + '</div>' : "") +
      block("Asymmetry / where the crowd is offside", "Where the crowd is offside — the risk/reward skew that matters more than the last tick.", b.asymmetry ? '<div class="bd-t">' + esc(b.asymmetry) + '</div>' : "") +
      levels +
      block("What would change this read", "The STRUCTURAL falsifiers of this big-picture read — an MA cross, a range break, a regime flip. What would make you tear up the frame.", list(b.whatWouldChangeIt));
  }
})();
