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

  /* ═══════════ Feature 002 Scope 10 — distributed-brief shared renderer (pure layer) ═══════════
     Dual-runtime (Node-safe; extracted + tested by selftest and renderer.unit). Contract parsers,
     byte-cap/path/registry/hash/run verifiers, a safe-link classifier, and the state-vocabulary
     owner. This layer performs NO source/model/recommendation/evidence CALCULATION — it parses,
     verifies, and LABELS already-published immutable static-artifact objects only. */

  var BRIEF_CONTRACT = {
    pointer: "brief-current-pointer/v1", historyPointer: "brief-history-pointer/v1",
    manifest: "brief-run-manifest/v1", read: "tool-model-read/v1", brief: "tool-brief/v1",
    final: "final-brief/v1", index: "brief-index/v1"
  };
  var BRIEF_EVIDENCE_CONTRACT = {
    "calendar-session": "calendar-session/v1", "session-aggregate": "session-aggregate/v1",
    "comparable-volume-baseline": "comparable-volume-baseline/v1",
    "released-report-evidence": "released-report-evidence/v1",
    "event-market-reaction": "event-market-reaction/v1"
  };
  /* byte caps (design.md "Artifact Size, Cardinality, and Retention Budgets") */
  var BRIEF_CAP = {
    pointer: 262144, historyPointer: 262144, manifest: 1048576, read: 131072, brief: 98304,
    final: 524288, index: 1048576, evidence: 262144, jsonlRow: 65536, partition: 4194304
  };
  var BRIEF_ENUM = {
    readStatus: { "fresh": 1, "stale": 1, "unavailable": 1, "not-run": 1, "not-applicable": 1, "browser-or-agent-read": 1, "fresh-headless": 1 },
    briefOutcome: { "newly-authored": 1, "carried-forward": 1, "no-recommendation": 1, "coverage-only": 1 },
    profile: { "live-market": 1, "static-model": 1, "local-model": 1, "off-theme": 1, "final-aggregator": 1 },
    role: { "source": 1, "final-aggregator": 1 },
    actionFamily: { "hold": 1, "trim": 1, "add": 1, "hedge": 1, "rotate": 1 },
    sessionKind: { "pre-market": 1, "regular": 1, "after-hours": 1 },
    aggregateState: { "available": 1, "partial": 1, "stale": 1, "unavailable": 1, "misaligned": 1, "disputed": 1 },
    comparableState: { "qualified": 1, "thin": 1, "unavailable": 1 },
    unusualness: { "high": 1, "low": 1, "ordinary": 1, "not-qualified": 1, "zero-dispersion": 1, "unavailable": 1 },
    reportState: { "upcoming": 1, "released": 1, "revised": 1, "stale": 1, "unavailable": 1, "disputed": 1 },
    reactionState: { "partial": 1, "complete": 1, "stale": 1, "unavailable": 1, "disputed": 1 },
    loadState: { "loading": 1, "ready": 1, "empty": 1, "stale": 1, "thin": 1, "integrity-error": 1, "integrity-unavailable": 1, "non-current": 1 }
  };

  function briefIsObject(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function briefErr(code, reason) { return { ok: false, error: { code: code, reason: reason } }; }

  /* UTF-8 byte length without Node Buffer (dual-runtime). */
  function briefByteLength(s) {
    if (s == null) return 0; s = String(s);
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s).length;
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) n += 1; else if (c < 0x800) n += 2;
      else if (c >= 0xd800 && c <= 0xdbff) { n += 4; i++; } else n += 3;
    }
    return n;
  }

  /* enforce a byte cap, JSON-parse, and (optionally) an exact contractVersion. Fail-closed. */
  function briefParseArtifact(text, cap, contractVersion) {
    if (typeof text !== "string") return briefErr("B002-PUBLISH-SET", "non-string-body");
    if (isFinite(cap) && briefByteLength(text) > cap) return briefErr("B002-ARTIFACT-BUDGET", "byte-cap-exceeded");
    var obj; try { obj = JSON.parse(text); } catch (e) { return briefErr("B002-PUBLISH-SET", "malformed-json"); }
    if (!briefIsObject(obj)) return briefErr("B002-PUBLISH-SET", "not-an-object");
    if (contractVersion && obj.contractVersion !== contractVersion) return briefErr("B002-PUBLISH-SET", "contract-version-mismatch");
    return { ok: true, value: obj };
  }

  /* a declared static object reference: immutable relative path (safe slug) + exact sha256. */
  function briefValidRef(ref) {
    return briefIsObject(ref) && typeof ref.path === "string" && briefSafeSlug(ref.path) &&
      typeof ref.sha256 === "string" && /^sha256:[0-9a-f]{64}$/i.test(ref.sha256);
  }

  /* a safe same-origin artifact slug: only briefs/ or data/ trees, no traversal, no scheme/host. */
  function briefSafeSlug(path) {
    if (typeof path !== "string" || !path.length) return false;
    if (/[:\\]/.test(path) || path.indexOf("//") >= 0 || path.charAt(0) === "/") return false;
    if (path.indexOf("..") >= 0) return false;
    if (!/^(briefs|data)\//.test(path)) return false;
    return /^[A-Za-z0-9._\/-]+$/.test(path);
  }

  /* classify an authored/structural link: same-origin registry path, validated https citation,
     or unsafe (rejected). Rejects javascript:/data:/protocol-relative/credentialed/malformed. */
  function briefClassifyLink(href, opts) {
    opts = opts || {}; var allow = opts.registryPaths || {};
    if (typeof href !== "string" || !href.length) return { kind: "unsafe", reason: "empty" };
    if (/[\s]/.test(href)) return { kind: "unsafe", reason: "whitespace" };
    if (/^(javascript|data|vbscript|file|blob):/i.test(href)) return { kind: "unsafe", reason: "forbidden-scheme" };
    if (href.indexOf("//") === 0) return { kind: "unsafe", reason: "protocol-relative" };
    if (/^https?:\/\//i.test(href)) {
      var u; try { u = new URL(href); } catch (e) { return { kind: "unsafe", reason: "malformed" }; }
      if (u.protocol !== "https:") return { kind: "unsafe", reason: "not-https" };
      if (u.username || u.password) return { kind: "unsafe", reason: "credentialed" };
      if (u.hash) return { kind: "unsafe", reason: "fragment" };
      return { kind: "https-citation", href: u.href };
    }
    /* same-origin registry path: a known registry file (e.g. sector-research-lab.html) or a briefs/ slug */
    var base = href.split("#")[0].split("?")[0];
    if (allow[base]) return { kind: "registry-path", href: href };
    if (/^[A-Za-z0-9._-]+\.html$/.test(base) && opts.allowHtml) return { kind: "registry-path", href: href };
    if (briefSafeSlug(base)) return { kind: "registry-path", href: href };
    return { kind: "unsafe", reason: "unrecognized-path" };
  }

  /* case-insensitive sha256 hex equality, tolerant of an optional "sha256:" prefix. */
  function briefHashEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return false;
    var na = a.replace(/^sha256:/i, "").toLowerCase(), nb = b.replace(/^sha256:/i, "").toLowerCase();
    return na.length === 64 && na === nb;
  }

  /* BriefCurrentPointer/v1 parse+validate: generation, run identity, manifest/final/bundle refs,
     registry counts, and a source-ID-keyed map whose keys are the ordered source tool IDs. */
  function briefParsePointer(text) {
    var p = briefParseArtifact(text, BRIEF_CAP.pointer, BRIEF_CONTRACT.pointer);
    if (!p.ok) return p; var o = p.value;
    if (!(Number.isInteger(o.generation) && o.generation >= 1)) return briefErr("B002-PUBLISH-SET", "generation-invalid");
    if (typeof o.runId !== "string" || !o.runId) return briefErr("B002-PUBLISH-SET", "run-id-missing");
    if (!briefValidRef(o.manifestRef)) return briefErr("B002-PUBLISH-SET", "manifest-ref-invalid");
    if (o.finalRef != null && !briefValidRef(o.finalRef)) return briefErr("B002-PUBLISH-SET", "final-ref-invalid");
    if (o.evidenceRef != null && !briefValidRef(o.evidenceRef)) return briefErr("B002-PUBLISH-SET", "bundle-ref-invalid");
    var cutoffAt = (briefIsObject(o.evidenceRef) && o.evidenceRef.cutoffAt) || o.cutoffAt;
    if (typeof cutoffAt !== "string" || !cutoffAt) return briefErr("B002-TIMESTAMP", "cutoff-missing");
    if (!briefIsObject(o.registry) || !Number.isInteger(o.registry.participantCount) || !Number.isInteger(o.registry.sourceCount)) return briefErr("B002-REGISTRY", "registry-counts-invalid");
    if (o.registry.sourceCount !== o.registry.participantCount - 1) return briefErr("B002-REGISTRY", "source-count-not-participants-minus-one");
    if (!briefIsObject(o.tools)) return briefErr("B002-PUBLISH-SET", "sources-map-missing");
    var ids = Object.keys(o.tools);
    if (ids.length !== o.registry.sourceCount) return briefErr("B002-REGISTRY", "source-map-cardinality");
    var sources = {};
    for (var i = 0; i < ids.length; i++) {
      var s = o.tools[ids[i]];
      if (!briefIsObject(s)) return briefErr("B002-PUBLISH-SET", "source-entry-invalid");
      var readRef = { path: s.readPath, sha256: s.readSha256 };
      var briefRef = { path: s.briefPath, sha256: s.briefSha256 };
      if (!briefValidRef(readRef) || !briefValidRef(briefRef)) return briefErr("B002-PUBLISH-SET", "source-entry-invalid");
      if (!BRIEF_ENUM.briefOutcome[s.outcome]) return briefErr("B002-PUBLISH-SET", "source-outcome-enum");
      sources[ids[i]] = { read: readRef, brief: briefRef, outcome: s.outcome };
    }
    var value = {
      contractVersion: o.contractVersion, generation: o.generation, runId: o.runId, runFingerprint: o.runFingerprint,
      cutoffAt: cutoffAt, registry: o.registry, orderedSourceToolIds: o.orderedSourceToolIds,
      manifest: { path: o.manifestRef.path, sha256: o.manifestRef.sha256 },
      final: briefIsObject(o.finalRef) ? { path: o.finalRef.path, sha256: o.finalRef.sha256 } : null,
      evidenceBundle: briefIsObject(o.evidenceRef) ? { path: o.evidenceRef.path, sha256: o.evidenceRef.sha256 } : null,
      sources: sources
    };
    return { ok: true, value: value };
  }

  /* the ordered source tool IDs DERIVED from the pointer's source map (never a literal count). */
  function briefPointerCoverage(pointer) {
    if (!briefIsObject(pointer) || !briefIsObject(pointer.sources)) return [];
    return Object.keys(pointer.sources);
  }

  /* BriefRunManifest/v1 parse+validate: run identity, generation, and the declared inventory
     (path/bytes/sha256 per published object). */
  function briefParseManifest(text) {
    var p = briefParseArtifact(text, BRIEF_CAP.manifest, BRIEF_CONTRACT.manifest);
    if (!p.ok) return p; var o = p.value;
    if (typeof o.runId !== "string" || !o.runId) return briefErr("B002-PUBLISH-SET", "run-id-missing");
    if (!Array.isArray(o.inventory) || !o.inventory.length) return briefErr("B002-PUBLISH-SET", "inventory-missing");
    for (var i = 0; i < o.inventory.length; i++) {
      var it = o.inventory[i];
      var bytes = Number.isInteger(it.bytes) ? it.bytes : it.byteLength;
      if (!briefIsObject(it) || !briefSafeSlug(it.path) || !Number.isInteger(bytes) || !/^sha256:[0-9a-f]{64}$/i.test(it.sha256 || "")) return briefErr("B002-PUBLISH-SET", "inventory-entry-invalid");
    }
    return { ok: true, value: o };
  }

  /* the declared inventory entry for a path, or null. Used to prove a fetched object is declared. */
  function briefManifestEntry(manifest, path) {
    if (!briefIsObject(manifest) || !Array.isArray(manifest.inventory)) return null;
    for (var i = 0; i < manifest.inventory.length; i++) if (manifest.inventory[i].path === path) return manifest.inventory[i];
    return null;
  }

  /* two objects belong to the same run when their runId agrees, and their runFingerprint too when
     both carry it (mixed-run rejection). Every referenced object is ALSO SHA-256 content-addressed
     against the pointer's exact ref, so a substituted cross-run object fails the byte hash regardless. */
  function briefRunCoherent(a, b) {
    if (!briefIsObject(a) || !briefIsObject(b) || !a.runId || a.runId !== b.runId) return false;
    if (a.runFingerprint && b.runFingerprint && a.runFingerprint !== b.runFingerprint) return false;
    return true;
  }

  /* ToolModelRead/v1 parse+validate (bounded to the fields the shared UI reads/verifies). */
  function briefParseRead(text) {
    var p = briefParseArtifact(text, BRIEF_CAP.read, BRIEF_CONTRACT.read);
    if (!p.ok) return p; var o = p.value;
    if (typeof o.toolId !== "string" || !o.toolId) return briefErr("B002-READ-BARRIER", "tool-id-missing");
    if (!BRIEF_ENUM.profile[o.profile]) return briefErr("B002-REGISTRY", "profile-enum");
    if (o.role != null && !BRIEF_ENUM.role[o.role]) return briefErr("B002-REGISTRY", "role-enum");
    if (!BRIEF_ENUM.readStatus[o.status]) return briefErr("B002-READ-BARRIER", "status-enum");
    if (typeof o.summary !== "string") return briefErr("B002-READ-BARRIER", "summary-missing");
    if (o.recommendationEligibility != null && (!briefIsObject(o.recommendationEligibility) || typeof o.recommendationEligibility.eligible !== "boolean")) return briefErr("B002-READ-BARRIER", "eligibility-shape");
    if (o.evidenceRefs != null) {
      if (!Array.isArray(o.evidenceRefs)) return briefErr("B002-READ-BARRIER", "evidence-refs-shape");
      for (var i = 0; i < o.evidenceRefs.length; i++) if (!briefValidRef(o.evidenceRefs[i])) return briefErr("B002-PUBLISH-SET", "evidence-ref-invalid");
    }
    if (o.display != null && !briefIsObject(o.display)) return briefErr("B002-READ-BARRIER", "display-shape");
    return { ok: true, value: o };
  }

  /* ToolBrief/v1 parse+validate. A market recommendation is legal ONLY for a live-market profile
     with an eligible read; the parser rejects a recommendation on an ineligible/other-profile read
     and rejects any action family outside the closed market vocabulary. */
  function briefParseBrief(text, read) {
    var p = briefParseArtifact(text, BRIEF_CAP.brief, BRIEF_CONTRACT.brief);
    if (!p.ok) return p; var o = p.value;
    if (typeof o.toolId !== "string" || !o.toolId) return briefErr("B002-TOOL-AUTHOR", "tool-id-missing");
    if (!BRIEF_ENUM.briefOutcome[o.outcome]) return briefErr("B002-TOOL-AUTHOR", "outcome-enum");
    if (typeof o.summary !== "string") return briefErr("B002-TOOL-AUTHOR", "summary-missing");
    var recs = o.recommendations || [];
    if (!Array.isArray(recs)) return briefErr("B002-TOOL-AUTHOR", "recommendations-shape");
    var eligible = read && briefIsObject(read.recommendationEligibility) && read.recommendationEligibility.eligible === true && read.profile === "live-market";
    if (recs.length && !eligible) return briefErr("B002-TOOL-AUTHOR", "recommendation-on-ineligible-read");
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (!briefIsObject(r) || !BRIEF_ENUM.actionFamily[r.actionFamily]) return briefErr("B002-TOOL-AUTHOR", "action-family-enum");
      if (!r.trigger || !r.invalidation) return briefErr("B002-TOOL-AUTHOR", "recommendation-missing-falsifier");
    }
    return { ok: true, value: o };
  }

  /* FinalBrief/v1 parse+validate: coverage per participant, source refs per source, counts, and
     the ordered outcome groups (included/merged/conflicted/coverage-only/excluded). */
  function briefParseFinal(text) {
    var p = briefParseArtifact(text, BRIEF_CAP.final, BRIEF_CONTRACT.final);
    if (!p.ok) return p; var o = p.value;
    if (typeof o.runId !== "string" || !o.runId) return briefErr("B002-FINAL-AUTHOR", "run-id-missing");
    if (!briefIsObject(o.registry) || !Number.isInteger(o.registry.participantCount)) return briefErr("B002-REGISTRY", "registry-counts");
    if (!Array.isArray(o.coverage) || o.coverage.length !== o.registry.participantCount) return briefErr("B002-FINAL-AUTHOR", "coverage-cardinality");
    if (!Array.isArray(o.finalActions)) return briefErr("B002-FINAL-AUTHOR", "final-actions-shape");
    for (var i = 0; i < o.finalActions.length; i++) {
      var a = o.finalActions[i];
      if (!briefIsObject(a) || !BRIEF_ENUM.actionFamily[a.actionFamily]) return briefErr("B002-FINAL-AUTHOR", "final-action-enum");
      if (!Array.isArray(a.ownerInterpretationRefs) || !a.ownerInterpretationRefs.length) return briefErr("B002-FINAL-AUTHOR", "final-action-without-owner-interpretation");
    }
    return { ok: true, value: o };
  }

  /* a typed immutable evidence object by kind (loaded on disclosure). */
  function briefParseEvidence(text, kind) {
    var cv = BRIEF_EVIDENCE_CONTRACT[kind];
    if (!cv) return briefErr("B002-PUBLISH-SET", "unknown-evidence-kind");
    var p = briefParseArtifact(text, BRIEF_CAP.evidence, cv);
    if (!p.ok) return p; var o = p.value;
    if (kind === "session-aggregate" && !BRIEF_ENUM.aggregateState[o.state]) return briefErr("B002-SESSION-REQUIRED", "aggregate-state-enum");
    if (kind === "comparable-volume-baseline" && (!BRIEF_ENUM.comparableState[o.state] || !BRIEF_ENUM.unusualness[o.unusualness])) return briefErr("B002-COMPARABILITY", "comparable-enum");
    if (kind === "released-report-evidence" && !BRIEF_ENUM.reportState[o.state]) return briefErr("B002-REPORT-REQUIRED", "report-state-enum");
    if (kind === "event-market-reaction" && !BRIEF_ENUM.reactionState[o.state]) return briefErr("B002-REACTION", "reaction-state-enum");
    return { ok: true, value: o };
  }

  /* one JSONL history partition parse+validate: bounded row bytes; EVERY line must parse before
     any row is usable — an invalid line suppresses the entire chronology (returns not-ok). */
  function briefParsePartition(text, expectStream) {
    if (typeof text !== "string") return briefErr("B002-HISTORY", "non-string-body");
    if (briefByteLength(text) > BRIEF_CAP.partition) return briefErr("B002-ARTIFACT-BUDGET", "partition-byte-cap");
    var lines = text.split("\n"), rows = [];
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i]; if (!ln.length) continue;
      if (briefByteLength(ln) > BRIEF_CAP.jsonlRow) return briefErr("B002-ARTIFACT-BUDGET", "row-byte-cap");
      var row; try { row = JSON.parse(ln); } catch (e) { return briefErr("B002-HISTORY", "malformed-row"); }
      if (!briefIsObject(row) || typeof row.eventType !== "string") return briefErr("B002-HISTORY", "row-shape");
      if (expectStream && row.stream && row.stream !== expectStream) return briefErr("B002-HISTORY", "stream-mismatch");
      rows.push(row);
    }
    return { ok: true, value: rows };
  }

  /* ── state-vocabulary owner (exact UX text from spec.md / scope.md matrix) ── */
  function briefStatusLabel(status) {
    return {
      "fresh": "Current", "stale": "Stale evidence", "unavailable": "Evidence unavailable",
      "not-run": "Not run this cycle", "not-applicable": "Session evidence not applicable to this profile",
      "browser-or-agent-read": "Open the tool for the live read", "fresh-headless": "Current (server-side read)"
    }[status] || "Unknown state";
  }
  function briefOutcomeLabel(outcome) {
    return {
      "newly-authored": "Newly authored", "carried-forward": "Carried forward",
      "no-recommendation": "No recommendation", "coverage-only": "Coverage only"
    }[outcome] || "Unknown outcome";
  }
  /* extended-hours latest is ALWAYS labeled with its session kind and "indicative"; the prior
     official close is a SEPARATE anchor and is never aliased to the latest. */
  function briefIndicativeLabel(kind) {
    if (kind === "pre-market") return "Pre-market - indicative";
    if (kind === "after-hours") return "After-hours - indicative";
    if (kind === "regular") return "Regular session - partial";
    return "Indicative";
  }
  function briefOfficialCloseLabel() { return "Official close"; }
  function briefVolumeStateLabel(state) {
    return {
      "observed": "Observed volume", "observed-zero": "Observed zero volume", "missing": "Volume missing",
      "complete": "Complete volume", "partial": "Partial volume", "all-observed-zero": "All observed-zero"
    }[state] || "Volume state unknown";
  }
  function briefComparableStateLabel(state, unusualness) {
    var base = { "qualified": "Qualified sample", "thin": "Thin sample", "unavailable": "Comparison unavailable" }[state] || "Unknown sample";
    var u = { "high": "unusually high", "low": "unusually low", "ordinary": "ordinary", "not-qualified": "not qualified for an anomaly", "zero-dispersion": "zero dispersion", "unavailable": "unavailable" }[unusualness];
    return u ? base + " - " + u : base;
  }
  function briefReportStateLabel(state) {
    return {
      "upcoming": "Not released", "released": "Released", "revised": "Revised",
      "stale": "Stale (historical only)", "unavailable": "Report unavailable", "disputed": "Disputed sources"
    }[state] || "Unknown report state";
  }
  function briefReactionStateLabel(state) {
    return {
      "partial": "Reaction in progress", "complete": "Reaction complete", "stale": "Reaction stale",
      "unavailable": "Reaction unavailable", "disputed": "Reaction disputed"
    }[state] || "Unknown reaction state";
  }
  function briefCalendarLabel(dateState, closureLabel) {
    if (dateState === "regular") return "Regular session";
    if (dateState === "early-close") return "Early close";
    if (dateState === "holiday") return "Market holiday" + (closureLabel ? " - " + closureLabel : "");
    if (dateState === "weekend") return "Weekend - market closed";
    return "Calendar state unknown";
  }
  function briefLoadStateText(loadState) {
    return {
      "loading": "Loading the latest verified publication...",
      "empty": "No published brief yet.",
      "stale": "Showing the last verified publication.",
      "thin": "Thin evidence - not qualified for an anomaly.",
      "integrity-error": "Could not verify this brief; showing no partial evidence",
      "integrity-unavailable": "Integrity verification is unavailable in this browser; showing no unverified evidence",
      "non-current": "A later run did not pass validation and is not current.",
      "ready": ""
    }[loadState] || "";
  }
  function briefLastVerifiedLabel() { return "Last verified publication"; }
  function briefLowNoiseLabel() { return "Context only - action gate not met"; }
  /* profile-specific honesty boundary label. */
  function briefProfileBoundary(profile) {
    return {
      "live-market": "", "static-model": "Committed projection - static evaluation date",
      "local-model": "Committed projection - browser-only where live data is unavailable",
      "off-theme": "excluded: off-theme", "final-aggregator": ""
    }[profile];
  }
  /* the four distinct clocks as labeled display strings (never collapsed into one). */
  function briefClockLabels(read) {
    read = read || {};
    return [
      { label: "Evaluated", value: read.evaluatedAt || null },
      { label: "Model as-of", value: read.modelAsOf || null },
      { label: "Source as-of", value: read.sourceAsOf || null },
      { label: "Fresh until", value: read.freshUntil || null }
    ];
  }

  root.RLBRIEF.BRIEF_CONTRACT = BRIEF_CONTRACT;
  root.RLBRIEF.BRIEF_EVIDENCE_CONTRACT = BRIEF_EVIDENCE_CONTRACT;
  root.RLBRIEF.BRIEF_CAP = BRIEF_CAP;
  root.RLBRIEF.BRIEF_ENUM = BRIEF_ENUM;
  root.RLBRIEF.briefByteLength = briefByteLength;
  root.RLBRIEF.briefParseArtifact = briefParseArtifact;
  root.RLBRIEF.briefSafeSlug = briefSafeSlug;
  root.RLBRIEF.briefValidRef = briefValidRef;
  root.RLBRIEF.briefClassifyLink = briefClassifyLink;
  root.RLBRIEF.briefHashEqual = briefHashEqual;
  root.RLBRIEF.briefParsePointer = briefParsePointer;
  root.RLBRIEF.briefPointerCoverage = briefPointerCoverage;
  root.RLBRIEF.briefParseManifest = briefParseManifest;
  root.RLBRIEF.briefManifestEntry = briefManifestEntry;
  root.RLBRIEF.briefRunCoherent = briefRunCoherent;
  root.RLBRIEF.briefParseRead = briefParseRead;
  root.RLBRIEF.briefParseBrief = briefParseBrief;
  root.RLBRIEF.briefParseFinal = briefParseFinal;
  root.RLBRIEF.briefParseEvidence = briefParseEvidence;
  root.RLBRIEF.briefParsePartition = briefParsePartition;
  root.RLBRIEF.briefStatusLabel = briefStatusLabel;
  root.RLBRIEF.briefOutcomeLabel = briefOutcomeLabel;
  root.RLBRIEF.briefIndicativeLabel = briefIndicativeLabel;
  root.RLBRIEF.briefOfficialCloseLabel = briefOfficialCloseLabel;
  root.RLBRIEF.briefVolumeStateLabel = briefVolumeStateLabel;
  root.RLBRIEF.briefComparableStateLabel = briefComparableStateLabel;
  root.RLBRIEF.briefReportStateLabel = briefReportStateLabel;
  root.RLBRIEF.briefReactionStateLabel = briefReactionStateLabel;
  root.RLBRIEF.briefCalendarLabel = briefCalendarLabel;
  root.RLBRIEF.briefLoadStateText = briefLoadStateText;
  root.RLBRIEF.briefLastVerifiedLabel = briefLastVerifiedLabel;
  root.RLBRIEF.briefLowNoiseLabel = briefLowNoiseLabel;
  root.RLBRIEF.briefProfileBoundary = briefProfileBoundary;
  root.RLBRIEF.briefClockLabels = briefClockLabels;

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
      var rows = Array.isArray(items) ? items : [items];
      return '<ul class="bd-list">' + rows.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>';
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

  /* ═══════════ Feature 002 Scope 10 — distributed-brief shared renderer (DOM layer) ═══════════
     Loads pointer(no-store) -> manifest -> one read+brief (source) or one final (aggregator),
     verifies content-type/byte-cap/contract/path/run/SHA-256 before rendering, renders authored
     text via textContent only, allows only same-origin registry paths or validated https
     citations, and lazily loads evidence/history only on explicit disclosure. It NEVER computes
     owner evidence/models — it renders verified published objects and the state vocabulary. */

  function briefPageDir() {
    var p = (typeof location !== "undefined" && location.pathname) || "/";
    var i = p.lastIndexOf("/"); return i >= 0 ? p.slice(0, i + 1) : "/";
  }
  function briefEl(tag, opts) {
    var e = document.createElement(tag);
    if (opts) {
      if (opts.text != null) e.textContent = String(opts.text);
      if (opts.cls) e.className = opts.cls;
      if (opts.part) e.setAttribute("data-rlbrief-part", opts.part);
      if (opts.attrs) for (var k in opts.attrs) if (opts.attrs[k] != null) e.setAttribute(k, String(opts.attrs[k]));
    }
    return e;
  }
  function briefRegistryEntry(registry, toolId) {
    var arr = Array.isArray(registry) ? registry : (registry && (registry.tools || registry.registry)) || [];
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].id === toolId) return arr[i];
    return null;
  }
  function briefRegistryPaths(registry) {
    var arr = Array.isArray(registry) ? registry : (registry && (registry.tools || registry.registry)) || [], map = {};
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].file) map[arr[i].file] = 1;
    return map;
  }
  /* a rejected/registry-path/https-citation-aware anchor; unsafe links become inert labels. */
  function briefSafeAnchor(text, href, registryPaths) {
    var cls = briefClassifyLink(href, { registryPaths: registryPaths, allowHtml: true });
    if (cls.kind === "unsafe") return briefEl("span", { text: text, cls: "rlbrief-nolink", attrs: { "data-rlbrief-link": "rejected", title: "link not shown - " + cls.reason } });
    var a = briefEl("a", { text: text, attrs: { href: cls.href, "data-rlbrief-link": cls.kind } });
    if (cls.kind === "https-citation") { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer"); a.setAttribute("referrerpolicy", "no-referrer"); }
    return a;
  }

  /* SHA-256 hex via Web Crypto; null when crypto.subtle is unavailable (integrity-unavailable). */
  async function briefSha256Hex(text) {
    if (typeof crypto === "undefined" || !crypto.subtle || typeof TextEncoder === "undefined") return null;
    var buf = new TextEncoder().encode(text);
    var digest = await crypto.subtle.digest("SHA-256", buf);
    var bytes = new Uint8Array(digest), hex = "";
    for (var i = 0; i < bytes.length; i++) hex += ("0" + bytes[i].toString(16)).slice(-2);
    return hex;
  }
  /* fetch a text body; pointers use cache:no-store. Returns a safe state on 404/redirect/error. */
  async function briefFetchText(url, noStore) {
    var res;
    try { res = await fetch(url, noStore ? { cache: "no-store" } : undefined); }
    catch (e) { return { ok: false, state: "integrity-error", reason: "network" }; }
    if (res.status === 404) return { ok: false, state: "empty", reason: "not-found" };
    if (res.redirected) return { ok: false, state: "integrity-error", reason: "redirected" };
    if (!res.ok) return { ok: false, state: "integrity-error", reason: "http-" + res.status };
    var ct = (res.headers.get && (res.headers.get("content-type") || "") || "").toLowerCase();
    var text; try { text = await res.text(); } catch (e2) { return { ok: false, state: "integrity-error", reason: "body" }; }
    return { ok: true, text: text, contentType: ct };
  }
  /* fetch + fully verify a JSON object: content-type, byte-cap+contract (via parser), SHA-256. */
  async function briefFetchVerify(url, opts) {
    var r = await briefFetchText(url, !!opts.noStore);
    if (!r.ok) return r;
    var wantNdjson = opts.contentType === "ndjson";
    if (wantNdjson ? r.contentType.indexOf("ndjson") < 0 : r.contentType.indexOf("json") < 0) return { ok: false, state: "integrity-error", reason: "content-type" };
    if (opts.expectSha) {
      var actual = await briefSha256Hex(r.text);
      if (actual == null) return { ok: false, state: "integrity-unavailable", reason: "no-web-crypto" };
      if (!briefHashEqual(opts.expectSha, actual)) return { ok: false, state: "integrity-error", reason: "hash-mismatch" };
    }
    var parsed = opts.parser(r.text, opts.parseArg);
    if (!parsed.ok) return { ok: false, state: "integrity-error", reason: parsed.error.reason };
    return { ok: true, value: parsed.value, text: r.text };
  }

  function briefInjectCss() {
    if (document.getElementById("rlbrief-mount-css")) return;
    var s = document.createElement("style"); s.id = "rlbrief-mount-css";
    s.textContent = [
      ".rlbrief-mount{margin:18px 0;padding:0;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#dce7f0}",
      ".rlbrief-mount>*+*{margin-top:12px;border-top:1px solid #22303e;padding-top:12px}",
      ".rlbrief-mount h2,.rlbrief-mount h3{margin:0 0 6px;font-size:15px}",
      ".rlbrief-mount [data-rlbrief-link=rejected]{color:#f0556b;text-decoration:line-through}",
      ".rlbrief-badge{font-weight:700}.rlbrief-sub{color:#8aa0b3;font-size:12px}",
      ".rlbrief-mount table{border-collapse:collapse;width:100%;font-size:12px}.rlbrief-mount caption{text-align:left;color:#8aa0b3;font-size:11px;padding-bottom:4px}",
      ".rlbrief-mount th,.rlbrief-mount td{border:1px solid #22303e;padding:4px 6px;text-align:left}",
      ".rlbrief-mount details>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:650}",
      ".rlbrief-mount button{min-height:44px;min-width:44px;cursor:pointer;background:#16212c;color:inherit;border:1px solid #2a3a49;border-radius:8px;padding:6px 12px}",
      ".rlbrief-mount ol,.rlbrief-mount ul{margin:6px 0;padding-left:20px}",
      ".rlbrief-mount .rlbrief-token{overflow-wrap:anywhere;word-break:break-word}",
      "@media(max-width:430px){.rlbrief-mount table,.rlbrief-mount thead,.rlbrief-mount tbody,.rlbrief-mount tr,.rlbrief-mount th,.rlbrief-mount td{display:block;width:auto}.rlbrief-mount thead{position:absolute;left:-9999px}}"
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }

  function briefSetState(anchor, mount, state, badge) {
    // "loading" is the only transient state; data-rlbrief-ready signals a SETTLED load attempt, so it is
    // set on terminal states only — a consumer that waits for data-rlbrief-ready="1" must not race the load.
    if (state !== "loading") anchor.setAttribute("data-rlbrief-ready", "1");
    anchor.setAttribute("data-rlbrief-state", state);
    if (badge) { badge.textContent = briefLoadStateText(state) || badge.textContent; badge.setAttribute("data-rlbrief-state", state); }
  }
  function briefLiveRegion(mount) {
    var r = briefEl("p", { cls: "rlbrief-sub", part: "status", attrs: { role: "status", "aria-live": "polite" } });
    mount.appendChild(r); return r;
  }

  /* ── per-tool read enrichment: surface the structured metrics a deterministic read carries
     (rankings, leaders, key numbers) so a rich brief shows real content, plus the tool's own
     authored description for coverage-only tools (this renderer runs on the tool's own page). ── */
  function briefToolDescription() {
    try {
      var m = document.querySelector('meta[name="description"]');
      var c = m && m.getAttribute("content");
      if (!c) return "";
      c = c.replace(/\s+/g, " ").trim();
      return c.length > 360 ? c.slice(0, 357) + "\u2026" : c;
    } catch (e) { return ""; }
  }
  function briefMetricsScalars(metrics) {
    var out = [];
    ["leader", "horizon", "risk", "regime", "signal", "score", "scored", "period", "level", "asOf", "window", "bias", "state", "direction"].forEach(function (k) {
      if (metrics[k] != null && typeof metrics[k] !== "object") out.push(k + ": " + metrics[k]);
    });
    return out;
  }
  function briefNum(v) { return (v == null) ? "-" : (typeof v === "number" ? String(Math.round(v * 100) / 100) : String(v)); }
  function briefRenderMetrics(host, metrics) {
    if (!metrics || typeof metrics !== "object") return;
    var scalars = briefMetricsScalars(metrics);
    if (scalars.length) host.appendChild(briefEl("p", { part: "metrics", cls: "rlbrief-sub rlbrief-token", text: scalars.join(" \u00b7 ") }));
    var ranked = metrics.ranked || metrics.rankings || metrics.leaders || metrics.rows || metrics.members;
    if (!Array.isArray(ranked) || !ranked.length || typeof ranked[0] !== "object") return;
    var first = ranked[0];
    var labelKey = ["ticker", "symbol", "name", "id", "label", "sector"].filter(function (k) { return first[k] != null; })[0] || null;
    var numKeys = Object.keys(first).filter(function (k) { return k !== labelKey && typeof first[k] === "number"; }).slice(0, 3);
    if (!labelKey && !numKeys.length) return;
    var t = briefEl("table", { part: "metrics-ranked" });
    var head = briefEl("tr");
    [(labelKey || "item")].concat(numKeys).forEach(function (h) { head.appendChild(briefEl("th", { text: h, attrs: { scope: "col" } })); });
    var thead = briefEl("thead"); thead.appendChild(head); t.appendChild(thead);
    var tb = briefEl("tbody");
    ranked.slice(0, 8).forEach(function (row) {
      var tr = briefEl("tr");
      tr.appendChild(briefEl("td", { text: labelKey ? String(row[labelKey]) : "-" }));
      numKeys.forEach(function (k) { tr.appendChild(briefEl("td", { cls: "rlbrief-token", text: briefNum(row[k]) })); });
      tb.appendChild(tr);
    });
    t.appendChild(tb); host.appendChild(t);
  }

  /* ── the source (single-tool) current section ── */
  function briefRenderSource(mount, entry, read, brief, badge, registryPaths, base, pointer) {
    var simple = briefEl("div", { part: "simple", attrs: { id: "rlbrief-simple" } });
    if (read.display && read.display.calendar) {
      var cal = read.display.calendar;
      simple.appendChild(briefEl("p", { part: "context", cls: "rlbrief-sub", text: briefCalendarLabel(cal.dateState, cal.closureLabel) + (cal.nextOpenTradingDate ? " \u00b7 Next session: " + cal.nextOpenTradingDate : "") + (cal.officialCloseAt ? " \u00b7 Official close: " + cal.officialCloseAt : "") }));
    }
    var status = briefEl("p", { cls: "rlbrief-badge", part: "text-status", text: briefOutcomeLabel(brief.outcome) + " - " + briefStatusLabel(read.status) });
    simple.appendChild(status);
    var boundary = briefProfileBoundary(read.profile);
    if (boundary) simple.appendChild(briefEl("p", { cls: "rlbrief-sub", part: "boundary", text: boundary }));
    /* Coverage-only briefs carry an internal authoring reason in `summary` (why no
       server-side read exists), not a user signal. Present an honest, user-facing
       coverage line instead. Gated on the known internal-reason prefix so a future
       proper source-authored coverage summary passes through unchanged. */
    var briefSummaryText = brief.summary;
    if (brief.outcome === "coverage-only" && /^No deterministic Tier-A adapter/.test(briefSummaryText || "")) {
      briefSummaryText = "Runs live in your browser \u2014 no precomputed server-side signal, so this brief covers the tool without fabricating a recommendation. Open the tool for the current read.";
    }
    simple.appendChild(briefEl("p", { part: "summary", text: briefSummaryText }));
    /* Rich structured metrics (rankings / key numbers) from a deterministic read — the main
       substance of a rich brief. Coverage-only tools have none; show the tool's own description. */
    if (read.metrics && typeof read.metrics === "object") briefRenderMetrics(simple, read.metrics);
    if (brief.outcome === "coverage-only") {
      var briefAbout = briefToolDescription();
      if (briefAbout) {
        simple.appendChild(briefEl("p", { part: "tool-about-label", cls: "rlbrief-sub", text: "What this tool does" }));
        simple.appendChild(briefEl("p", { part: "tool-about", text: briefAbout }));
      }
    }
    /* decision / recommendations OR the exact no-recommendation reason */
    if (brief.recommendations && brief.recommendations.length) {
      var rl = briefEl("ul", { part: "recommendations" });
      brief.recommendations.forEach(function (r) {
        var li = briefEl("li");
        li.appendChild(briefEl("b", { text: r.actionFamily + ": " + (r.subjects || []).join(", ") }));
        li.appendChild(briefEl("div", { cls: "rlbrief-sub", text: "trigger: " + r.trigger + " · invalidation: " + r.invalidation + " · horizon: " + (r.horizon || "n/a") + " · confidence: " + (r.confidenceScore == null ? "n/a" : r.confidenceScore) }));
        rl.appendChild(li);
      });
      simple.appendChild(rl);
    } else {
      simple.appendChild(briefEl("p", { part: "no-recommendation", text: "No recommendation - " + (brief.noRecommendationReason || (read.recommendationEligibility && read.recommendationEligibility.reasonCode) || "not eligible") }));
    }
    /* low-noise context (below action rows; consumes no action slot) */
    if (read.display && read.display.lowNoise) simple.appendChild(briefEl("p", { part: "low-noise", cls: "rlbrief-sub", text: briefLowNoiseLabel() }));
    mount.appendChild(simple);
    /* Power evidence (native disclosure) */
    var power = briefEl("details", { part: "power", attrs: { id: "rlbrief-power" } });
    power.appendChild(briefEl("summary", { text: "Evidence details" }));
    briefRenderPower(power, read, registryPaths, base, pointer);
    mount.appendChild(power);
    briefRenderHistorySection(mount, entry, base, pointer, registryPaths);
    briefModeBridge(power);
  }

  /* Power rows: official/indicative price, comparable volume, report, reaction, clocks, provenance.
     All values come from the already-verified read's bounded display block (no fetch on mode switch);
     raw evidence objects load only on the provenance/comparable/reaction disclosures below. */
  function briefRenderPower(power, read, registryPaths, base, pointer) {
    var d = read.display || {};
    if (d.session) {
      var t = briefEl("table", { part: "price" });
      t.appendChild(briefEl("caption", { text: "Session prices - official close is separate from the indicative latest" }));
      var head = briefEl("tr");["Anchor", "Value", "At"].forEach(function (h) { head.appendChild(briefEl("th", { text: h, attrs: { scope: "col" } })); });
      var thead = briefEl("thead"); thead.appendChild(head); t.appendChild(thead);
      var tb = briefEl("tbody");
      if (d.session.officialClose) {
        var r1 = briefEl("tr", { attrs: { "data-rlbrief-part": "official-close" } });
        r1.appendChild(briefEl("td", { text: briefOfficialCloseLabel() }));
        r1.appendChild(briefEl("td", { text: d.session.officialClose.value }));
        r1.appendChild(briefEl("td", { cls: "rlbrief-token", text: d.session.officialClose.at || "" }));
        tb.appendChild(r1);
      }
      if (d.session.indicative) {
        var r2 = briefEl("tr", { attrs: { "data-rlbrief-part": "indicative" } });
        r2.appendChild(briefEl("td", { text: briefIndicativeLabel(d.session.kind) }));
        r2.appendChild(briefEl("td", { text: d.session.indicative.latest }));
        r2.appendChild(briefEl("td", { cls: "rlbrief-token", text: d.session.indicative.latestAt || "" }));
        tb.appendChild(r2);
      }
      t.appendChild(tb); power.appendChild(t);
    }
    if (d.comparableVolume) {
      var cv = d.comparableVolume;
      var p = briefEl("p", { part: "comparable", text: briefComparableStateLabel(cv.state, cv.unusualness) });
      power.appendChild(p);
      power.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "sample: " + (cv.sample == null ? "n/a" : cv.sample) + " · coverage: " + (cv.coverage == null ? "n/a" : cv.coverage) + " · median: " + (cv.median == null ? "n/a" : cv.median) + " · percentile: " + (cv.percentile == null ? "n/a" : cv.percentile) + " · rVol: " + (cv.relativeVolume == null ? "n/a" : cv.relativeVolume) + " · " + briefVolumeStateLabel(cv.volumeState || "observed") }));
    }
    if (d.report) briefRenderReport(power, d.report);
    if (d.reaction) briefRenderReaction(power, d.reaction);
    /* clocks: four distinct labeled values */
    var clocks = briefEl("p", { part: "clocks", cls: "rlbrief-sub rlbrief-token" });
    clocks.textContent = briefClockLabels(read).map(function (c) { return c.label + ": " + (c.value || "-"); }).join(" · ");
    power.appendChild(clocks);
    (read.limitations || []).forEach(function (l) { power.appendChild(briefEl("p", { cls: "rlbrief-sub", part: "limitation", text: "Limitation: " + l })); });
    briefRenderProvenance(power, read, registryPaths, base, pointer);
  }

  function briefRenderReport(host, report) {
    var wrap = briefEl("div", { part: "report" });
    wrap.appendChild(briefEl("h3", { text: (report.reportType || "Report") + " - " + briefReportStateLabel(report.state) }));
    if (report.state === "upcoming") { wrap.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "No actual and no surprise until release." })); host.appendChild(wrap); return; }
    if (report.state === "disputed") {
      var dt = briefEl("table", { part: "report-dispute" });
      dt.appendChild(briefEl("caption", { text: "Provider records kept separate - synthesis blocked" }));
      var hr = briefEl("tr");["Source", "Value", "At"].forEach(function (h) { hr.appendChild(briefEl("th", { text: h, attrs: { scope: "col" } })); });
      var th = briefEl("thead"); th.appendChild(hr); dt.appendChild(th); var tbd = briefEl("tbody");
      (report.sourceRecords || []).forEach(function (s) {
        var tr = briefEl("tr");
        tr.appendChild(briefEl("td", { text: s.sourceId })); tr.appendChild(briefEl("td", { text: s.value })); tr.appendChild(briefEl("td", { cls: "rlbrief-token", text: s.at || "" }));
        tbd.appendChild(tr);
      });
      dt.appendChild(tbd); wrap.appendChild(dt); host.appendChild(wrap); return;
    }
    (report.metrics || []).forEach(function (m) {
      wrap.appendChild(briefEl("p", { cls: "rlbrief-sub", text: m.metricId + " actual: " + m.actual + " · consensus: " + (m.consensus == null ? "n/a" : m.consensus) + " · previous: " + (m.previous == null ? "n/a" : m.previous) + " · surprise: " + (m.surprise == null ? "n/a" : m.surprise) + " " + (m.unit || "") }));
    });
    if (report.state === "revised" && report.revision) {
      var rv = briefEl("div", { part: "report-revision" });
      rv.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "Original: " + report.revision.originalValue + " (" + report.revision.originalAt + ")" }));
      rv.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "Revision " + report.revision.revisionNumber + ": " + report.revision.value + " (" + report.revision.at + ") - appended, original preserved" }));
      wrap.appendChild(rv);
    }
    host.appendChild(wrap);
  }

  function briefRenderReaction(host, reaction) {
    var wrap = briefEl("div", { part: "reaction" });
    wrap.appendChild(briefEl("h3", { text: "Event reaction - " + briefReactionStateLabel(reaction.state) }));
    var ol = briefEl("ol", { part: "reaction-timeline" });
    var baseline = briefEl("li", { attrs: { "data-rlbrief-part": "reaction-baseline" }, text: "Baseline (pre-release): " + (reaction.baseline == null ? "n/a" : reaction.baseline) });
    ol.appendChild(baseline);
    (reaction.segments || []).forEach(function (seg) {
      ol.appendChild(briefEl("li", { attrs: { "data-rlbrief-part": "reaction-segment" }, text: seg.sessionKind + " segment - latest " + seg.latest + " · cutoff " + seg.cutoffAt + (seg.revision ? " · revision " + seg.revision : "") }));
    });
    wrap.appendChild(ol);
    wrap.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "Reaction bars are strictly post-release; the release bar itself is excluded." }));
    host.appendChild(wrap);
  }

  /* provenance disclosure: lazily fetch+verify ONE declared immutable evidence object on open. */
  function briefRenderProvenance(power, read, registryPaths, base, pointer) {
    if (!read.evidenceRefs || !read.evidenceRefs.length) return;
    var det = briefEl("details", { part: "provenance" });
    det.appendChild(briefEl("summary", { text: "Provenance and source evidence" }));
    var body = briefEl("div"); det.appendChild(body);
    var loaded = false;
    det.addEventListener("toggle", function () {
      if (!det.open || loaded) return; loaded = true;
      body.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "Loading declared evidence..." }));
      var ref = read.evidenceRefs[0];
      briefFetchVerify(base + ref.path, { cap: BRIEF_CAP.evidence, expectSha: ref.sha256, parseArg: ref.evidenceType, parser: briefParseEvidence }).then(function (r) {
        body.textContent = "";
        if (!r.ok) { body.appendChild(briefEl("p", { cls: "rlbrief-sub", part: "provenance-error", text: briefLoadStateText(r.state) || briefLoadStateText("integrity-error") })); return; }
        body.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "Evidence " + ref.evidenceType + " · state " + (r.value.state || "n/a") + " · cutoff " + (r.value.cutoffAt || "n/a") }));
        (read.sources || []).forEach(function (s) {
          var row = briefEl("div", { cls: "rlbrief-sub" });
          row.appendChild(document.createTextNode(s.sourceId + " · as-of " + (s.asOf || "n/a") + " "));
          if (s.citation) row.appendChild(briefSafeAnchor("citation", s.citation, registryPaths));
          body.appendChild(row);
        });
      });
    });
    power.appendChild(det);
  }

  /* ── the final (Market Brief aggregator) current section ── */
  function briefRenderFinal(mount, entry, final, badge, registryPaths, base, pointer) {
    var simple = briefEl("div", { part: "simple", attrs: { id: "rlbrief-simple" } });
    simple.appendChild(briefEl("p", { cls: "rlbrief-badge", part: "text-status", text: "Final coverage - " + (final.coverage.length) + " participants" }));
    if (final.windowContext) {
      var wc = final.windowContext;
      simple.appendChild(briefEl("p", { part: "window", cls: "rlbrief-sub", text: "Window: " + wc.window + " · cutoff " + wc.cutoffAt }));
      if (wc.window === "morning") {
        if (wc.priorWindowThesis) simple.appendChild(briefEl("p", { part: "prior-thesis", text: "Compared with the published pre-market thesis: " + wc.priorWindowThesis.summary + " (" + (wc.priorWindowThesis.ownerState || "state n/a") + ")" }));
        else simple.appendChild(briefEl("p", { part: "prior-thesis", text: "Prior-window thesis insufficient - not reconstructed from morning data." }));
      }
      if (wc.officialClose) simple.appendChild(briefEl("p", { part: "official-close", cls: "rlbrief-sub", text: briefOfficialCloseLabel() + ": " + wc.officialClose.value + " (" + wc.officialClose.at + ")" }));
    }
    (final.finalActions || []).forEach(function (a) {
      simple.appendChild(briefEl("p", { part: "final-action", text: a.actionFamily + ": " + (a.subjects || []).join(", ") + " · group " + a.aggregationGroup }));
    });
    if (!final.finalActions || !final.finalActions.length) simple.appendChild(briefEl("p", { part: "no-recommendation", text: "No final action this window." }));
    if (final.lowNoise) simple.appendChild(briefEl("p", { part: "low-noise", cls: "rlbrief-sub", text: briefLowNoiseLabel() }));
    mount.appendChild(simple);
    var power = briefEl("details", { part: "power", attrs: { id: "rlbrief-power" } });
    power.appendChild(briefEl("summary", { text: "Evidence details" }));
    /* coverage table */
    var t = briefEl("table", { part: "coverage" });
    t.appendChild(briefEl("caption", { text: "Coverage, merged origins, conflicts, and exclusions" }));
    var hr = briefEl("tr");["Participant", "Outcome"].forEach(function (h) { hr.appendChild(briefEl("th", { text: h, attrs: { scope: "col" } })); });
    var th = briefEl("thead"); th.appendChild(hr); t.appendChild(th); var tb = briefEl("tbody");
    final.coverage.forEach(function (c) {
      var tr = briefEl("tr", { attrs: { "data-rlbrief-outcome": c.outcome } });
      tr.appendChild(briefEl("td", { text: c.toolId })); tr.appendChild(briefEl("td", { text: c.outcome }));
      tb.appendChild(tr);
    });
    t.appendChild(tb); power.appendChild(t);
    (final.conflicts || []).forEach(function (cf) { power.appendChild(briefEl("p", { part: "conflicts", text: "Conflict kept separate: " + (cf.subjects || []).join(", ") + " - " + cf.reason })); });
    (final.excluded || []).forEach(function (ex) { power.appendChild(briefEl("p", { part: "excluded", cls: "rlbrief-sub", text: "Excluded " + ex.toolId + ": " + ex.reason })); });
    mount.appendChild(power);
    briefRenderHistorySection(mount, entry, base, pointer, registryPaths);
    briefModeBridge(power);
  }

  /* ── mode bridge: observes host body.power to optionally auto-open the mount's own Power panel;
     it NEVER writes host mode/state (host Simple/Power is preserved). ── */
  function briefModeBridge(powerDetails) {
    try {
      if (document.body && document.body.classList.contains("power")) powerDetails.open = true;
      if (typeof MutationObserver !== "undefined" && document.body) {
        var mo = new MutationObserver(function () { if (document.body.classList.contains("power")) powerDetails.open = true; });
        mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      }
    } catch (e) { /* preservation-safe: never throw into the host */ }
  }

  /* ── history: absent from network until "Open history"; then loads only the pointer + index and,
     on filter selection, exactly one monthly partition. ── */
  function briefRenderHistorySection(mount, entry, base, pointer, registryPaths) {
    var wrap = briefEl("div", { part: "history" });
    var btn = briefEl("button", { text: "Open history", attrs: { type: "button", "aria-expanded": "false" } });
    var panel = briefEl("div", { part: "history-panel" });
    var opened = false;
    btn.addEventListener("click", function () {
      if (opened) { panel.textContent = ""; btn.setAttribute("aria-expanded", "false"); opened = false; return; }
      opened = true; btn.setAttribute("aria-expanded", "true");
      panel.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "Loading history index..." }));
      briefFetchText(base + "briefs/history-current.json", true).then(function (hp) {
        panel.textContent = "";
        if (!hp.ok || hp.contentType.indexOf("json") < 0) { panel.appendChild(briefEl("p", { cls: "rlbrief-sub", part: "history-error", text: briefLoadStateText(hp.state) || briefLoadStateText("integrity-error") })); return; }
        var hpp; try { hpp = JSON.parse(hp.text); } catch (e) { panel.appendChild(briefEl("p", { part: "history-error", text: briefLoadStateText("integrity-error") })); return; }
        if (!hpp || hpp.contractVersion !== BRIEF_CONTRACT.historyPointer || !hpp.index) { panel.appendChild(briefEl("p", { part: "history-error", text: briefLoadStateText("integrity-error") })); return; }
        briefFetchVerify(base + hpp.index.path, { expectSha: hpp.index.sha256, parser: function (t) { var pp = briefParseArtifact(t, BRIEF_CAP.index, BRIEF_CONTRACT.index); if (!pp.ok) return pp; if (!Array.isArray(pp.value.partitions)) return briefErr("B002-HISTORY", "partitions-missing"); return pp; } }).then(function (ix) {
          if (!ix.ok) { panel.appendChild(briefEl("p", { part: "history-error", text: briefLoadStateText(ix.state) })); return; }
          briefRenderHistoryFilters(panel, ix.value, entry, base, registryPaths);
        });
      });
    });
    wrap.appendChild(btn); wrap.appendChild(panel); mount.appendChild(wrap);
  }
  function briefRenderHistoryFilters(panel, index, entry, base, registryPaths) {
    var isFinal = entry.briefing && entry.briefing.role === "final-aggregator";
    var parts = index.partitions.filter(function (p) { return isFinal || (p.stream && p.stream.indexOf("tools/" + entry.id) === 0) || p.stream === "recommendations" || p.stream === "final" || p.stream === "evidence"; });
    var fs = briefEl("div", { part: "history-filters" });
    fs.appendChild(briefEl("label", { text: "Select a monthly partition:", attrs: { for: "rlbrief-hist-select" } }));
    var sel = briefEl("select", { attrs: { id: "rlbrief-hist-select" } });
    sel.appendChild(briefEl("option", { text: "-", attrs: { value: "" } }));
    parts.forEach(function (p, i) { sel.appendChild(briefEl("option", { text: p.stream + " · " + p.month, attrs: { value: String(i) } })); });
    fs.appendChild(sel); panel.appendChild(fs);
    var out = briefEl("div", { part: "history-timeline-host" }); panel.appendChild(out);
    sel.addEventListener("change", function () {
      out.textContent = ""; var idx = sel.value === "" ? -1 : Number(sel.value); if (idx < 0) return;
      var part = parts[idx];
      out.appendChild(briefEl("p", { cls: "rlbrief-sub", text: "Loading partition..." }));
      briefFetchVerify(base + part.path, { contentType: "ndjson", expectSha: part.sha256, parser: function (t) { return briefParsePartition(t, part.stream); } }).then(function (r) {
        out.textContent = "";
        if (!r.ok) { out.appendChild(briefEl("p", { part: "history-error", text: briefLoadStateText(r.state) || briefLoadStateText("integrity-error") })); return; }
        var ol = briefEl("ol", { part: "history-timeline" });
        r.value.forEach(function (row) {
          ol.appendChild(briefEl("li", { attrs: { "data-rlbrief-event": row.eventType }, text: (row.occurredAt || row.at || "") + " · " + row.eventType + (row.detail ? " · " + row.detail : "") }));
        });
        out.appendChild(ol);
      });
    });
  }

  function briefRenderUnavailable(mount, message) {
    mount.appendChild(briefEl("p", { part: "unavailable", cls: "rlbrief-badge", text: message }));
  }

  /* ── the shared mount entry point ── */
  async function BriefMount(anchor, host) {
    host = host || {};
    if (!anchor || anchor.getAttribute("data-rlbrief-ready") === "1" || anchor.getAttribute("data-rlbrief-mounting") === "1") return;
    anchor.setAttribute("data-rlbrief-mounting", "1");
    var toolId = anchor.getAttribute("data-tool-id");
    briefInjectCss();
    var mount = briefEl("div", { cls: "rlbrief-mount" }); anchor.appendChild(mount);
    var base = host.pointerBase || briefPageDir();
    var registry = host.registry;
    if (!registry) {
      var reg = await briefFetchText(base + "tools.json", true);
      if (reg.ok) { try { registry = JSON.parse(reg.text); } catch (e) { registry = null; } }
    }
    var entry = briefRegistryEntry(registry, toolId);
    if (!entry) { briefRenderUnavailable(mount, "Shared brief mount references an unknown registry tool."); briefSetState(anchor, mount, "integrity-error"); return; }
    var registryPaths = briefRegistryPaths(registry);
    mount.appendChild(briefEl("h2", { text: entry.title + " - shared brief" }));
    var badge = briefLiveRegion(mount);
    briefSetState(anchor, mount, "loading", badge);
    var ptrRes = await briefFetchText(base + "briefs/current.json", true);
    if (!ptrRes.ok && ptrRes.state === "empty") { badge.textContent = briefLoadStateText("empty"); briefSetState(anchor, mount, "empty", badge); return; }
    if (!ptrRes.ok || ptrRes.contentType.indexOf("json") < 0) { badge.textContent = briefLoadStateText("integrity-error"); briefSetState(anchor, mount, "integrity-error", badge); return; }
    var ptr = briefParsePointer(ptrRes.text);
    if (!ptr.ok) { badge.textContent = briefLoadStateText("integrity-error"); briefSetState(anchor, mount, "integrity-error", badge); return; }
    var pointer = ptr.value;
    var man = await briefFetchVerify(base + pointer.manifest.path, { expectSha: pointer.manifest.sha256, parser: briefParseManifest });
    if (!man.ok) { badge.textContent = briefLoadStateText(man.state); briefSetState(anchor, mount, man.state === "integrity-unavailable" ? "integrity-unavailable" : "integrity-error", badge); return; }
    if (!briefRunCoherent(pointer, man.value)) { badge.textContent = briefLoadStateText("integrity-error"); briefSetState(anchor, mount, "integrity-error", badge); return; }
    var role = entry.briefing && entry.briefing.role;
    try {
      if (role === "final-aggregator") {
        if (!pointer.final) { briefRenderUnavailable(mount, "No current final publication."); briefSetState(anchor, mount, "empty", badge); return; }
        var fin = await briefFetchVerify(base + pointer.final.path, { expectSha: pointer.final.sha256, parser: briefParseFinal });
        if (!fin.ok) { badge.textContent = briefLoadStateText(fin.state); briefSetState(anchor, mount, fin.state === "integrity-unavailable" ? "integrity-unavailable" : "integrity-error", badge); return; }
        if (!briefRunCoherent(pointer, fin.value)) { badge.textContent = briefLoadStateText("integrity-error"); briefSetState(anchor, mount, "integrity-error", badge); return; }
        if (!briefManifestEntry(man.value, pointer.final.path)) { badge.textContent = briefLoadStateText("integrity-error"); briefSetState(anchor, mount, "integrity-error", badge); return; }
        briefRenderFinal(mount, entry, fin.value, badge, registryPaths, base, pointer);
      } else {
        var src = pointer.sources[toolId];
        if (!src) { briefRenderUnavailable(mount, "This source has no current read in the latest publication."); briefSetState(anchor, mount, "empty", badge); return; }
        var rd = await briefFetchVerify(base + src.read.path, { expectSha: src.read.sha256, parser: briefParseRead });
        if (!rd.ok) { badge.textContent = briefLoadStateText(rd.state); briefSetState(anchor, mount, rd.state === "integrity-unavailable" ? "integrity-unavailable" : "integrity-error", badge); return; }
        var br = await briefFetchVerify(base + src.brief.path, { expectSha: src.brief.sha256, parser: briefParseBrief, parseArg: rd.value });
        if (!br.ok) { badge.textContent = briefLoadStateText(br.state); briefSetState(anchor, mount, br.state === "integrity-unavailable" ? "integrity-unavailable" : "integrity-error", badge); return; }
        if (rd.value.toolId !== toolId || br.value.toolId !== toolId) { badge.textContent = briefLoadStateText("integrity-error"); briefSetState(anchor, mount, "integrity-error", badge); return; }
        briefRenderSource(mount, entry, rd.value, br.value, badge, registryPaths, base, pointer);
      }
      badge.textContent = ""; briefSetState(anchor, mount, "ready", badge);
    } catch (e) {
      badge.textContent = briefLoadStateText("integrity-error"); briefSetState(anchor, mount, "integrity-error", badge);
    }
  }

  root.RLBRIEF.BriefMount = BriefMount;
  root.RLBRIEF.briefModeBridge = briefModeBridge;
  root.RLBRIEF.briefSafeAnchor = briefSafeAnchor;
  root.RLBRIEF.briefSha256Hex = briefSha256Hex;
})();
