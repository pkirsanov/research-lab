/*
 * rlexperience-adapters/macro-rotation.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 06 — Macro / rotation Simple adapters.
 *
 * This module is the SINGLE OWNER SOURCE for the macro-rotation Simple model
 * formulas. The owning tool pages consume the exact same exported pure owner
 * functions in their Power path (see sector-research-lab.html), and the
 * registered Simple adapters call the same functions — so Simple and Power
 * share one formula and no formula is copied inline (owner-parity).
 *
 * Adapters are PURE COMPUTE over already-captured, frozen owner state. They
 * NEVER fetch, providerFetch, read local credentials, call an LLM, a public
 * publisher, or a private store; they never mutate owner state; and they never
 * import another domain adapter module. Data acquisition (RLDATA cache reads)
 * stays in the owning page; the page hands the adapter an already-loaded,
 * frozen owner snapshot through captureEvidence.
 *
 * Registration is by the exact declared adapter IDs from simple-models.json.
 * A tool whose owner seam is not yet extracted is simply absent from the
 * returned adapter set, so the shared runtime renders the Scope 04 explicit
 * "unavailable" truth state for it — never an invented signal or default.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser
 * global RLMACROROTATION for the owning pages.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLMACROROTATION_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLMACROROTATION = api;
})(function () {
  "use strict";

  /* ═══════════ pure owner primitives (single source; consumed by Power + Simple) ═══════════
     These mirror the sector-research-lab.html owner helpers exactly. The sector page uses the
     REAL global `isFinite` (there is no Number.isFinite shim on that page), so these owner
     primitives use the same global `isFinite` to stay byte-identical to the delegating page. */

  function mean(a) { var s = 0, n = a.length, i; for (i = 0; i < n; i++) s += a[i]; return n ? s / n : 0; }
  function variance(a) { var m = mean(a), s = 0, n = a.length, i; for (i = 0; i < n; i++) { var d = a[i] - m; s += d * d; } return n > 1 ? s / (n - 1) : 0; }
  function stdev(a) { return Math.sqrt(variance(a)); }

  /* rollZ100: rolling z-score → 100 + (x - mean)/sd over the last L finite values (minN = the
     larger of 8 and floor(L/2)). Byte-identical to sector-research-lab.html rollZ100. */
  function rollZ100(a, L) {
    var out = new Array(a.length), minN = Math.max(8, Math.floor(L * 0.5)), i, j;
    for (i = 0; i < a.length; i++) {
      if (!isFinite(a[i])) { out[i] = NaN; continue; }
      var vals = []; for (j = i; j >= 0 && vals.length < L; j--) { if (isFinite(a[j])) vals.push(a[j]); }
      if (vals.length < minN) { out[i] = NaN; continue; }
      var m = mean(vals), sd = stdev(vals); out[i] = sd ? 100 + (a[i] - m) / sd : 100;
    }
    return out;
  }

  /* rrgQuadrant: the RRG quadrant from the relative-strength ratio + momentum z-scores. Owner
     formula (mirrors the inline quad expression in sector-research-lab.html computeEntry). */
  function rrgQuadrant(rsRatio, rsMom) {
    return rsRatio >= 100 ? (rsMom >= 100 ? "L" : "W") : (rsMom >= 100 ? "I" : "A");
  }

  /* stateLabel: quad + acceleration → the owner state label, preserving the early-turn detection
     (Peaking / Basing). Byte-identical to sector-research-lab.html stateLabel. */
  function stateLabel(quad, accel) {
    if (quad === "L") return accel < -0.15 ? { t: "Peaking ⚠", c: "st-peak", early: 1 } : { t: "Leading", c: "st-lead", early: 0 };
    if (quad === "W") return { t: "Weakening ↓", c: "st-weak", early: 0 };
    if (quad === "A") return accel > 0.15 ? { t: "Basing ↑", c: "st-base", early: 1 } : { t: "Lagging", c: "st-lag", early: 0 };
    if (quad === "I") return { t: "Improving ↑", c: "st-improve", early: 0 };
    return { t: "—", c: "", early: 0 };
  }

  /* backVal: change of an array over `span` bars ending at index `last`; 0 when either endpoint is
     missing. Mirrors the sector-research-lab.html computeEntry closure (last passed explicitly). */
  function backVal(arr, span, last) {
    var j = last - span;
    return (j >= 0 && isFinite(arr[j]) && isFinite(arr[last])) ? arr[last] - arr[j] : 0;
  }

  /* rotationCandidacy: the Simple into/out classifier over a computed view. Owner formula shared
     with sector-research-lab.html sectorSimpleCandidates (confirmed / strict / early tempos). */
  function rotationCandidacy(view, confirmation) {
    var inTurn = view.quad === "I" || (view.state && view.state.t === "Basing ↑") || (view.quad === "L" && view.accel > 0.2);
    var outTurn = (view.state && view.state.t === "Peaking ⚠") || view.quad === "W";
    if (confirmation === "strict") {
      inTurn = inTurn && view.accel > 0.2 && isFiniteNumber(view.x3) && view.x3 > 0;
      outTurn = outTurn && view.accel < -0.2 && isFiniteNumber(view.x3) && view.x3 < 0;
    } else if (confirmation === "early") {
      inTurn = inTurn || (view.quad === "A" && view.accel > 0);
      outTurn = outTurn || (view.quad === "L" && view.accel < 0);
    }
    return { inTurn: inTurn, outTurn: outTurn };
  }

  /* rrgReadout: the full RRG kernel from an aligned relative-strength ratio series. `momSpan` is
     the short-lookback momentum span (M); `zWindow` is the long-lookback z-score window (L). This
     is the single-source RRG owner formula both the page (computeEntry) and the adapter consume. */
  function rrgReadout(rs, momSpan, zWindow) {
    var rsRatioArr = rollZ100(rs, zWindow);
    var rom = [], i;
    for (i = 0; i < rsRatioArr.length; i++) {
      rom.push(i >= momSpan && isFinite(rsRatioArr[i]) && isFinite(rsRatioArr[i - momSpan]) ? rsRatioArr[i] - rsRatioArr[i - momSpan] : NaN);
    }
    var rsMomArr = rollZ100(rom, zWindow);
    var last = -1;
    for (i = rsRatioArr.length - 1; i >= 0; i--) { if (isFinite(rsRatioArr[i]) && isFinite(rsMomArr[i])) { last = i; break; } }
    if (last < 0) {
      return { rsRatioArr: rsRatioArr, rsMomArr: rsMomArr, last: -1, rsRatio: null, rsMom: null, quad: null, accel: 0 };
    }
    var rsRatio = rsRatioArr[last], rsMom = rsMomArr[last];
    return {
      rsRatioArr: rsRatioArr,
      rsMomArr: rsMomArr,
      last: last,
      rsRatio: rsRatio,
      rsMom: rsMom,
      quad: rrgQuadrant(rsRatio, rsMom),
      accel: backVal(rsMomArr, 10, last)
    };
  }

  /* ═══════════ sector-rotation Simple model (owner seam = sector-research-lab.html) ═══════════ */

  function isFiniteNumber(value) { return typeof value === "number" && isFinite(value); }

  function roundTo(value, digits) {
    if (!isFiniteNumber(value)) return null;
    var factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  /* min-max normalize a list to 0..1 (null-safe; degenerate spread → 0.5). Mirrors the sector page
     normList. Used to combine acceleration and risk on one comparable scale for the rank. */
  function normList(vals) {
    var fin = vals.filter(function (v) { return v != null && isFiniteNumber(v); });
    if (!fin.length) return vals.map(function () { return null; });
    var mn = Math.min.apply(null, fin), mx = Math.max.apply(null, fin), sp = mx - mn;
    return vals.map(function (v) { return (v == null || !isFiniteNumber(v)) ? null : (sp ? (v - mn) / sp : 0.5); });
  }

  function sectorBenchmarkSeries(sector, benchmark) {
    if (!sector || !sector.rs || typeof sector.rs !== "object") return null;
    var series = sector.rs[benchmark];
    return Array.isArray(series) ? series : null;
  }

  /* Compute one sector's frozen view from its rs series under the current lookbacks + benchmark. */
  function sectorView(sector, params) {
    var benchmark = params.benchmark;
    var rs = sectorBenchmarkSeries(sector, benchmark);
    if (!rs) {
      return { id: String(sector.id), label: String(sector.label || sector.id), rsRatio: null, rsMom: null, quad: null, accel: 0, state: stateLabel(null, 0), x3: null, breadth: null, riskScore: null, etf: sector.etf || null, priced: false };
    }
    var kernel = rrgReadout(rs, params["short-lookback"], params["long-lookback"]);
    var quad = kernel.quad;
    var accel = kernel.accel;
    return {
      id: String(sector.id),
      label: String(sector.label || sector.id),
      rsRatio: roundTo(kernel.rsRatio, 4),
      rsMom: roundTo(kernel.rsMom, 4),
      quad: quad,
      accel: roundTo(accel, 4),
      state: stateLabel(quad, accel),
      x3: isFiniteNumber(sector.x3) ? sector.x3 : null,
      breadth: isFiniteNumber(sector.breadthPct50) ? sector.breadthPct50 : null,
      riskScore: isFiniteNumber(sector.riskScore) ? sector.riskScore : null,
      etf: sector.etf && typeof sector.etf === "object" ? sector.etf : null,
      priced: kernel.last >= 0
    };
  }

  /* Compute the full sector-rotation summary from frozen owner state + current parameters. Every
     value derives from the single-source owner primitives; nothing is fabricated or defaulted. */
  function computeSectorRotationSummary(ownerState, params) {
    var benchmark = params.benchmark;
    var accelW = params["acceleration-weight"];
    var breadthW = params["breadth-weight"];
    var riskW = params["risk-weight"];
    var etfFitW = params["etf-fit-weight"];
    var sectors = (ownerState && Array.isArray(ownerState.sectors)) ? ownerState.sectors : [];

    var views = sectors.map(function (sector) { return sectorView(sector, params); });
    var priced = views.filter(function (view) { return view.priced; });

    // Rank: acceleration (normalized) + breadth − risk (normalized), each weighted.
    var accelN = normList(views.map(function (view) { return view.accel; }));
    var riskN = normList(views.map(function (view) { return view.riskScore; }));
    views.forEach(function (view, index) {
      var accelPart = accelN[index] == null ? 0 : accelN[index];
      var breadthPart = isFiniteNumber(view.breadth) ? view.breadth : 0;
      var riskPart = riskN[index] == null ? 0 : riskN[index];
      view.rankScore = roundTo(accelW * accelPart + breadthW * breadthPart - riskW * riskPart, 6);
    });
    var rank = views.map(function (view) { return { id: view.id, rankScore: view.rankScore }; })
      .sort(function (a, b) {
        var d = (b.rankScore == null ? -Infinity : b.rankScore) - (a.rankScore == null ? -Infinity : a.rankScore);
        if (d !== 0) return d;
        return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
      });

    // Transition: the into/out classification over the computed views (confirmed tempo).
    var into = [], out = [];
    views.forEach(function (view) {
      if (!view.priced) return;
      var candidacy = rotationCandidacy(view, "confirmed");
      if (candidacy.inTurn) into.push(view);
      if (candidacy.outTurn) out.push(view);
    });
    into.sort(function (a, b) { return b.accel - a.accel; });
    out.sort(function (a, b) { return a.accel - b.accel; });
    var transition = {
      sectors: views.map(function (view) {
        return { id: view.id, rsRatio: view.rsRatio, rsMom: view.rsMom, quad: view.quad, accel: view.accel, state: view.state.t };
      }),
      into: into.map(function (view) { return view.id; }),
      out: out.map(function (view) { return view.id; }),
      top: { into: into.length ? into[0].id : null, out: out.length ? out[0].id : null }
    };

    // Relative strength: benchmark-relative rsRatio leaders (moves when the benchmark changes).
    var leaders = priced.map(function (view) { return { id: view.id, rsRatio: view.rsRatio }; })
      .sort(function (a, b) {
        var d = (b.rsRatio == null ? -Infinity : b.rsRatio) - (a.rsRatio == null ? -Infinity : a.rsRatio);
        if (d !== 0) return d;
        return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
      });
    var relativeStrength = { leaders: leaders, top: leaders.length ? leaders[0].id : null };

    // Vehicle: the ETF-fit-weighted projection for the top rotation-into sector (fallback to the
    // top-ranked sector when no into candidate is confirmed).
    var vehicleId = into.length ? into[0].id : (rank.length ? rank[0].id : null);
    var vehicleView = views.find(function (view) { return view.id === vehicleId; }) || null;
    var vehicle = { sector: null, ticker: null, projection: null };
    if (vehicleView && vehicleView.etf && isFiniteNumber(vehicleView.etf.fit) && isFiniteNumber(vehicleView.etf.mom)) {
      vehicle = {
        sector: vehicleView.id,
        ticker: String(vehicleView.etf.ticker || "unavailable"),
        projection: roundTo(etfFitW * vehicleView.etf.fit + (1 - etfFitW) * vehicleView.etf.mom, 6)
      };
    } else if (vehicleView) {
      vehicle = { sector: vehicleView.id, ticker: null, projection: null };
    }

    return {
      benchmark: benchmark,
      shortLookback: params["short-lookback"],
      longLookback: params["long-lookback"],
      accelerationWeight: accelW,
      breadthWeight: breadthW,
      riskWeight: riskW,
      etfFitWeight: etfFitW,
      sectorCount: views.length,
      pricedCount: priced.length,
      transition: transition,
      rank: rank,
      relativeStrength: relativeStrength,
      vehicle: vehicle
    };
  }

  /* ═══════════ country-rotation Simple model (owner seam = global-rotation-lab.html) ═══════════
     The adapter is a DIFFERENT Simple question over the SAME frozen owner facts the page computes:
     a horizon-weighted research QUEUE (which country to rotate toward) plus a local-close FRESHNESS
     gate. It consumes the page's already-computed owner facts (benchmark-relative rel21/rel63/rel126,
     FX confirmation score, realized volatility, and the local-close age) and re-derives a queue under
     the adapter's own controls. The pairwise-correlation owner formula is single-sourced here so the
     page's Power path and this Simple adapter share ONE correlation source (page carries no inline
     copy). Everything else is a frozen owner fact — the adapter fabricates nothing and defaults
     nothing for missing evidence. */

  /* globalPairCorrelation: Pearson correlation of two ETF daily-return series over the trailing
     window (aligned by calendar date; >=12 overlapping returns required, else null). SINGLE SOURCE —
     global-rotation-lab.html delegates its inline correlation to this exact function. Byte-identical
     to the former page body (uses Number.isFinite explicitly, never the global isFinite). */
  function globalPairCorrelation(rowsA, rowsB, windowDays) {
    if (!Array.isArray(rowsA) || !Array.isArray(rowsB) || rowsA.length < 3 || rowsB.length < 3) return null;
    var window = Number.isFinite(windowDays) && windowDays > 2 ? Math.floor(windowDays) : 63;
    function returnMap(rows) {
      var out = {}, start = Math.max(1, rows.length - window - 8), i, previous, current, key;
      for (i = start; i < rows.length; i++) {
        previous = rows[i - 1]; current = rows[i];
        if (!previous || !current || !Number.isFinite(previous.c) || !Number.isFinite(current.c) || previous.c <= 0) continue;
        key = new Date(current.t).toISOString().slice(0, 10);
        out[key] = current.c / previous.c - 1;
      }
      return out;
    }
    var a = returnMap(rowsA), b = returnMap(rowsB), keys = Object.keys(a).filter(function (key) { return Number.isFinite(b[key]); }).sort();
    if (keys.length > window) keys = keys.slice(keys.length - window);
    if (keys.length < 12) return null;
    var meanA = 0, meanB = 0, i, da, db, covariance = 0, varianceA = 0, varianceB = 0;
    for (i = 0; i < keys.length; i++) { meanA += a[keys[i]]; meanB += b[keys[i]]; }
    meanA /= keys.length; meanB /= keys.length;
    for (i = 0; i < keys.length; i++) { da = a[keys[i]] - meanA; db = b[keys[i]] - meanB; covariance += da * db; varianceA += da * da; varianceB += db * db; }
    if (!(varianceA > 0) || !(varianceB > 0)) return null;
    return Math.max(-1, Math.min(1, covariance / Math.sqrt(varianceA * varianceB)));
  }

  /* countryHorizonMomentum: the horizon-weighted relative-momentum blend used by the Simple queue.
     Each benchmark-relative return is scaled by its horizon dispersion (21d/63d/126d), clamped to
     [-1,1], and averaged under the caller's explicit short/medium/long weights. A missing relative or
     a non-positive weight is skipped, never defaulted to a neutral fill. This is the queue's own
     horizon-weighted question — distinct from the page's fixed-weight leaderboard momentum. */
  function countryHorizonMomentum(rel21, rel63, rel126, weights) {
    var values = { "21": rel21, "63": rel63, "126": rel126 }, scales = { "21": 8, "63": 14, "126": 22 };
    var wmap = { "21": weights.short, "63": weights.medium, "126": weights.long };
    var keys = ["21", "63", "126"], total = 0, weight = 0, i, key, value, w;
    for (i = 0; i < keys.length; i++) {
      key = keys[i]; value = values[key]; w = wmap[key];
      if (!isFiniteNumber(value) || !isFiniteNumber(w) || w <= 0) continue;
      total += Math.max(-1, Math.min(1, value / scales[key])) * w;
      weight += w;
    }
    return weight > 0 ? total / weight : null;
  }

  /* countryVolComponent: higher realized volatility raises the penalty component (0..1); missing vol
     stays null so the volatility penalty simply does not apply (never a fabricated fill). */
  function countryVolComponent(vol) {
    return isFiniteNumber(vol) ? Math.max(0, Math.min(1, (vol - 0.10) / 0.30)) : null;
  }

  /* countryDiversification: how uncorrelated this country is to the rest, from the single-sourced
     owner correlation. No measurable pair => null (unavailable), never a fabricated default. */
  function countryDiversification(country, countries) {
    var corrs = [];
    countries.forEach(function (other) {
      if (other.id === country.id) return;
      if (!Array.isArray(country.rows) || !Array.isArray(other.rows)) return;
      var corr = globalPairCorrelation(country.rows, other.rows, 63);
      if (isFiniteNumber(corr)) corrs.push(corr);
    });
    if (!corrs.length) return null;
    return Math.max(0, Math.min(1, (1 - mean(corrs)) / 2));
  }

  /* Compute the full country-rotation summary from frozen owner state + current parameters. The
     queue score derives from the single-source horizon momentum, the frozen FX/volatility facts, and
     the single-source correlation; freshness derives from the frozen local-close age. Nothing is
     fabricated and missing evidence never becomes a default. */
  function computeCountryRotationSummary(ownerState, params) {
    var shortW = params["short-horizon-weight"];
    var medW = params["medium-horizon-weight"];
    var longW = params["long-horizon-weight"];
    var fxW = params["fx-weight"];
    var volPen = params["volatility-penalty"];
    var divW = params["diversification-weight"];
    var maxAge = params["local-close-max-age"];
    var weights = { short: shortW, medium: medW, long: longW };
    var countries = (ownerState && Array.isArray(ownerState.countries)) ? ownerState.countries : [];

    var views = countries.map(function (country) {
      var momentum = countryHorizonMomentum(country.rel21, country.rel63, country.rel126, weights);
      var fx = isFiniteNumber(country.fxScore) ? country.fxScore : null;
      var volComp = countryVolComponent(country.vol);
      var divComp = countryDiversification(country, countries);
      var priced = isFiniteNumber(momentum);
      var raw = priced
        ? momentum
          + (fx == null ? 0 : fxW * fx)
          - (volComp == null ? 0 : volPen * volComp)
          + (divComp == null ? 0 : divW * divComp)
        : null;
      var score = priced ? roundTo(Math.max(0, Math.min(100, 50 + raw * 50)), 4) : null;
      return {
        id: String(country.id),
        label: String(country.label || country.id),
        momentum: roundTo(momentum, 6),
        fx: fx == null ? null : roundTo(fx, 6),
        volComponent: volComp == null ? null : roundTo(volComp, 6),
        diversification: divComp == null ? null : roundTo(divComp, 6),
        score: score,
        priced: priced
      };
    });

    var priced = views.filter(function (view) { return view.priced; });
    var queue = priced.map(function (view) {
      return { id: view.id, score: view.score, momentum: view.momentum, fx: view.fx, diversification: view.diversification };
    }).sort(function (a, b) {
      var d = (b.score == null ? -Infinity : b.score) - (a.score == null ? -Infinity : a.score);
      if (d !== 0) return d;
      return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
    });

    var freshness = {
      maxAgeHours: maxAge,
      countries: countries.map(function (country) {
        var age = isFiniteNumber(country.localCloseAgeHours) ? country.localCloseAgeHours : null;
        return {
          id: String(country.id),
          ageHours: age,
          state: age == null ? "unavailable" : (age <= maxAge ? "fresh" : "stale")
        };
      })
    };

    return {
      benchmark: String((ownerState && ownerState.benchmark) || "unavailable"),
      shortHorizonWeight: shortW,
      mediumHorizonWeight: medW,
      longHorizonWeight: longW,
      fxWeight: fxW,
      volatilityPenalty: volPen,
      diversificationWeight: divW,
      localCloseMaxAge: maxAge,
      countryCount: views.length,
      pricedCount: priced.length,
      queue: queue,
      freshness: freshness
    };
  }

  /* ═══════════ Simple adapter contract wiring ═══════════ */

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function fingerprintOf(api, value) {
    return api.fingerprint(value);
  }

  /* Compute the Scope 04 simple-evidence-identity/v1 fingerprint for an evidence snapshot, matching
     rlexperience.js simpleEvidenceIdentity EXACTLY. Shared framework infrastructure, not a formula. */
  function evidenceIdentityOf(api, evidence) {
    return fingerprintOf(api, {
      contractVersion: "simple-evidence-identity/v1",
      toolId: evidence.toolId,
      state: evidence.state,
      evidenceCutoff: evidence.evidenceCutoff,
      evidenceRefs: evidence.evidenceRefs.map(function (reference) {
        return {
          requirementId: reference.requirementId,
          evidenceRef: reference.evidenceRef,
          semanticFingerprint: reference.semanticFingerprint,
          sourceClass: reference.sourceClass,
          valueState: reference.valueState
        };
      }),
      parameterValues: evidence.parameterValues,
      assumptions: evidence.assumptions,
      limitations: evidence.limitations,
      invalidationConditions: evidence.invalidationConditions
    });
  }

  function paramMap(input) {
    var values = Object.create(null);
    input.parameters.forEach(function (parameter) { values[parameter.parameterId] = parameter.value; });
    return values;
  }

  function ownerStateFingerprint(api, ownerState) {
    return fingerprintOf(api, ownerState);
  }

  function sectorEvidenceState(ownerState) {
    var sectors = (ownerState && Array.isArray(ownerState.sectors)) ? ownerState.sectors : [];
    var priced = 0;
    sectors.forEach(function (sector) {
      var benchmarks = (ownerState && Array.isArray(ownerState.benchmarks)) ? ownerState.benchmarks : Object.keys(sector.rs || {});
      var anyBench = benchmarks.some(function (benchmark) { return Array.isArray(sector.rs && sector.rs[benchmark]) && sector.rs[benchmark].length >= 8; });
      if (anyBench) priced++;
    });
    return priced > 0 ? "ready" : "unavailable";
  }

  /* Build a valid simple-evidence-snapshot/v1 from a frozen owner snapshot. */
  function buildSectorEvidence(api, ownerState) {
    var state = sectorEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "sector-research-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:sector-research-lab:rotation:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Rotation uses only the frozen owner relative-strength series currently captured."
      ],
      limitations: [
        "The rotation model describes the selected owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses a sector, or a later observation replaces the current window."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function sectorOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.sectorCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.sectorCount +
      " sectors carry a complete owner relative-strength window.";
    var uncertaintyState = summary.pricedCount >= 2 ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: "Into " + (summary.transition.top.into || "—") + " / out " + (summary.transition.top.out || "—"),
        reason: "Transition, rank, relative strength, and vehicle fit use the exact frozen owner series currently captured."
      },
      assumptions: [
        "Sectors without a complete relative-strength window are excluded from the priced transition and leaders."
      ],
      limitations: [
        "The rotation model describes the selected owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later observation replaces the current window."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the sector-rotation parameters. Used to prove the declared output path
     actually moves (or a modeled flat region is proved). Mirrors simple-models.json exactly. */
  var SECTOR_OUTPUT_PATHS = {
    "short-lookback": ["summary.transition"],
    "long-lookback": ["summary.transition"],
    "acceleration-weight": ["summary.rank"],
    "breadth-weight": ["summary.rank"],
    "risk-weight": ["summary.rank"],
    "benchmark": ["summary.relativeStrength"],
    "etf-fit-weight": ["summary.vehicle"]
  };

  function summaryPath(summary, path) {
    if (path === "summary.transition") return summary.transition;
    if (path === "summary.rank") return summary.rank;
    if (path === "summary.relativeStrength") return summary.relativeStrength;
    if (path === "summary.vehicle") return summary.vehicle;
    return null;
  }

  function createSectorRotationAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.sectors)) {
          return { ok: false, error: { reason: "sector owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildSectorEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeSectorRotationSummary(ownerState, paramMap(input));
        return { ok: true, value: sectorOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeSectorRotationSummary(ownerState, baselineValues);
        var currentSummary = computeSectorRotationSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = SECTOR_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, summaryPath(baselineSummary, path)) !== fingerprintOf(api, summaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner snapshot yields an identical value on these paths for this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        var into = summary.transition.top.into;
        var out = summary.transition.top.out;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: into ? ("Rotate toward " + into) : (out ? (out + " weakening") : "No confirmed rotation"),
            numericValue: summary.relativeStrength.leaders.length ? summary.relativeStrength.leaders[0].rsRatio : null,
            unit: "rs-ratio",
            summary: into && out
              ? ("Rotation favors " + into + " as " + out + " rolls over (benchmark " + summary.benchmark + ").")
              : (into
                ? (into + " is the clearest improving rotation (benchmark " + summary.benchmark + ").")
                : (out
                  ? (out + " is weakening; no replacement is confirmed.")
                  : "No rotation is confirmed under the selected owner window.")),
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ country-rotation adapter contract wiring ═══════════ */

  function countryEvidenceState(ownerState) {
    var countries = (ownerState && Array.isArray(ownerState.countries)) ? ownerState.countries : [];
    var priced = 0;
    countries.forEach(function (country) {
      if (isFiniteNumber(country.rel21) || isFiniteNumber(country.rel63) || isFiniteNumber(country.rel126)) priced++;
    });
    return priced > 0 ? "ready" : "unavailable";
  }

  function buildCountryEvidence(api, ownerState) {
    var state = countryEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "global-rotation-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:global-rotation-lab:country-rotation:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Country rotation uses only the frozen owner relative-momentum, FX, volatility, and local-close facts currently captured."
      ],
      limitations: [
        "The queue describes the selected owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses a country, or a later local close replaces the current window."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function countryOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.countryCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.countryCount +
      " countries carry a complete owner relative-momentum window.";
    var uncertaintyState = summary.pricedCount >= 2 ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    var leader = summary.queue.length ? summary.queue[0].id : null;
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: leader ? ("Queue leader " + leader) : "No priced country",
        reason: "Queue and freshness use the exact frozen owner relative-momentum, FX, volatility, correlation, and local-close facts currently captured."
      },
      assumptions: [
        "Countries without a complete relative-momentum window are excluded from the priced queue."
      ],
      limitations: [
        "The queue describes the selected owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later local close replaces the current window."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the country-rotation parameters. Mirrors simple-models.json exactly. */
  var COUNTRY_OUTPUT_PATHS = {
    "short-horizon-weight": ["summary.queue"],
    "medium-horizon-weight": ["summary.queue"],
    "long-horizon-weight": ["summary.queue"],
    "fx-weight": ["summary.queue"],
    "local-close-max-age": ["summary.freshness"],
    "volatility-penalty": ["summary.queue"],
    "diversification-weight": ["summary.queue"]
  };

  function countrySummaryPath(summary, path) {
    if (path === "summary.queue") return summary.queue;
    if (path === "summary.freshness") return summary.freshness;
    return null;
  }

  function createCountryRotationAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.countries)) {
          return { ok: false, error: { reason: "country owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildCountryEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeCountryRotationSummary(ownerState, paramMap(input));
        return { ok: true, value: countryOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeCountryRotationSummary(ownerState, baselineValues);
        var currentSummary = computeCountryRotationSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = COUNTRY_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, countrySummaryPath(baselineSummary, path)) !== fingerprintOf(api, countrySummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner snapshot yields an identical value on these paths for this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        var leader = summary.queue.length ? summary.queue[0].id : null;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: leader ? ("Rotate toward " + leader) : "No confirmed country rotation",
            numericValue: summary.queue.length ? summary.queue[0].score : null,
            unit: "country-score",
            summary: leader
              ? (leader + " leads the country queue (benchmark " + summary.benchmark + ").")
              : "No country clears the queue under the selected owner window.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ real-asset-driver Simple model (owner seam = real-assets-lab.html) ═══════════
     The adapter is a DIFFERENT Simple question over FROZEN owner facts the page computes: a bounded
     asset-specific driver SCENARIO for the SELECTED asset under USD/rate/risk shocks, plus a scenario
     score, a drawdown-limit risk state, and a commodity-breadth confirmation. It consumes the page's
     already-computed per-asset facts (owner score, volatility, drawdown) and the universe driver
     deltas (uup63/tlt63/tip63/qqq63/...), and re-derives a scenario under the adapter's own controls.
     The commodity-breadth owner formula is single-sourced here so the page's breadthScore and this
     Simple adapter share ONE breadth source (the page carries no inline breadth reduction). Everything
     else is a frozen owner fact — the adapter fabricates nothing and defaults nothing for missing
     evidence. NOTE: the page's driver-model formulas (goldModelScore/etc.) are extracted STANDALONE by
     out-of-boundary consumers, so they are NOT delegated; the bounded driver tilt below is the
     adapter's OWN scenario question, not a copy of any page model formula. */

  /* realBreadthPct: of the finite commodity-family 63-day returns, the fraction that are positive,
     times 100 (null when no finite return exists). SINGLE SOURCE — real-assets-lab.html breadthScore
     delegates its inline reduction to this exact function. Uses Number.isFinite explicitly to match
     the real-assets page (which uses Number.isFinite throughout, never the global isFinite). */
  function realBreadthPct(returns) {
    if (!Array.isArray(returns)) return null;
    var finiteReturns = returns.filter(function (value) { return Number.isFinite(value); });
    if (!finiteReturns.length) return null;
    var positive = finiteReturns.reduce(function (sum, value) { return sum + (value > 0 ? 1 : 0); }, 0);
    return positive / finiteReturns.length * 100;
  }

  /* realAssetTilt: a bounded [-1,1] tilt of a driver delta under an explicit scale (0 when the value
     or scale is not finite/positive). This is the adapter's OWN scenario scaling — deliberately NOT
     the page's realSignalFromPct (which maps to 0..100 via 50 + clamp*50); it is a distinct bounded
     tilt for the driver-mix scenario question. */
  function realAssetTilt(value, scale) {
    return isFiniteNumber(value) && isFiniteNumber(scale) && scale > 0 ? Math.max(-1, Math.min(1, value / scale)) : 0;
  }

  /* realAssetDriverScenario: the adapter's bounded driver-mix scenario for the selected asset. A
     USD shock (percent) shifts the frozen dollar driver, a rate shock (basis points) shifts the
     frozen duration driver, and a risk-appetite shock (score) shifts the frozen equity-risk driver;
     the three are mapped to bounded tilts and blended into one composite tilt with a scenario state.
     Missing frozen drivers contribute nothing (a zero tilt), never a fabricated neutral. This is the
     adapter's distinct Simple question — it does not re-run or copy the page's authoritative model. */
  function realAssetDriverScenario(drivers, shocks) {
    var d = drivers && typeof drivers === "object" ? drivers : {};
    var usdShock = isFiniteNumber(shocks && shocks.usd) ? shocks.usd : 0;
    var rateShock = isFiniteNumber(shocks && shocks.rate) ? shocks.rate : 0;
    var riskShock = isFiniteNumber(shocks && shocks.risk) ? shocks.risk : 0;
    var usd = isFiniteNumber(d.uup63) ? d.uup63 + usdShock : null;
    var duration = isFiniteNumber(d.tlt63) ? d.tlt63 - rateShock / 100 : null;
    var risk = isFiniteNumber(d.qqq63) ? d.qqq63 + riskShock * 10 : null;
    var inverseUsd = usd == null ? 0 : realAssetTilt(-usd, 7);
    var durationTilt = duration == null ? 0 : realAssetTilt(duration, 9);
    var riskTilt = risk == null ? 0 : realAssetTilt(risk, 16);
    var tilt = Math.max(-1, Math.min(1, inverseUsd * 0.4 + durationTilt * 0.3 + riskTilt * 0.3));
    var state = tilt >= 0.15 ? "supportive" : (tilt <= -0.15 ? "headwind" : "mixed");
    return {
      state: state,
      tilt: roundTo(tilt, 6),
      components: {
        inverseUsd: roundTo(inverseUsd, 6),
        duration: roundTo(durationTilt, 6),
        riskAppetite: roundTo(riskTilt, 6)
      }
    };
  }

  /* realAssetScenarioScore: a bounded scenario stress overlay on the FROZEN owner score. The user's
     volatility-penalty weight scales an additional volatility/drawdown stress that is subtracted from
     the frozen owner score. A missing owner score stays null (unavailable) — never a fabricated fill.
     This is the adapter's own "weight volatility more" scenario, distinct from the page's realRiskPenalty. */
  function realAssetScenarioScore(ownerScore, volatility, drawdown, volPenaltyWeight) {
    if (!isFiniteNumber(ownerScore)) return null;
    var vol = isFiniteNumber(volatility) ? Math.max(0, volatility) : 0;
    var dd = isFiniteNumber(drawdown) ? Math.max(0, drawdown) : 0;
    var weight = isFiniteNumber(volPenaltyWeight) ? volPenaltyWeight : 0;
    var stress = (vol * 0.3 + dd * 0.2) * weight;
    return Math.max(0, Math.min(100, ownerScore - stress));
  }

  /* Compute the full real-asset-driver summary from frozen owner state + current parameters. The
     driver state derives from the frozen driver deltas under the bounded shocks, the score from the
     frozen owner score under the scenario stress, the risk state from the frozen drawdown vs the
     drawdown limit, and the confirmation from the single-source breadth vs the breadth threshold.
     Nothing is fabricated and missing evidence never becomes a default. */
  function computeRealAssetDriverSummary(ownerState, params) {
    var usdShock = params["usd-shock"];
    var rateShock = params["rate-shock"];
    var riskAppetite = params["risk-appetite"];
    var volPenalty = params["volatility-penalty"];
    var drawdownLimit = params["drawdown-limit"];
    var breadthThreshold = params["breadth-threshold"];
    var assets = (ownerState && Array.isArray(ownerState.assets)) ? ownerState.assets : [];
    var drivers = (ownerState && ownerState.drivers && typeof ownerState.drivers === "object") ? ownerState.drivers : {};
    var breadthReturns = (ownerState && Array.isArray(ownerState.breadthReturns)) ? ownerState.breadthReturns : [];
    var selectedId = String((ownerState && ownerState.selected) || (assets.length ? assets[0].id : "unavailable"));
    var selected = assets.find(function (asset) { return String(asset.id) === selectedId; }) || (assets.length ? assets[0] : null);

    var driverState = realAssetDriverScenario(drivers, { usd: usdShock, rate: rateShock, risk: riskAppetite });
    driverState.selected = selectedId;
    driverState.model = selected ? String(selected.model || "unavailable") : "unavailable";

    var ownerScore = selected && isFiniteNumber(selected.ownerScore) ? selected.ownerScore : null;
    var volatility = selected && isFiniteNumber(selected.volatility) ? selected.volatility : null;
    var drawdown = selected && isFiniteNumber(selected.drawdown) ? selected.drawdown : null;
    var score = realAssetScenarioScore(ownerScore, volatility, drawdown, volPenalty);

    var riskState = {
      drawdownLimit: drawdownLimit,
      drawdown: drawdown == null ? null : roundTo(drawdown, 4),
      state: drawdown == null ? "unavailable" : (drawdown > drawdownLimit ? "breached" : "within"),
      headroom: drawdown == null ? null : roundTo(drawdownLimit - drawdown, 4)
    };

    var breadth = realBreadthPct(breadthReturns);
    var confirmation = {
      breadthThreshold: breadthThreshold,
      breadth: breadth == null ? null : roundTo(breadth, 4),
      state: breadth == null ? "unavailable" : (breadth >= breadthThreshold ? "confirmed" : "unconfirmed"),
      margin: breadth == null ? null : roundTo(breadth - breadthThreshold, 4)
    };

    var priced = assets.filter(function (asset) { return isFiniteNumber(asset.ownerScore); });
    return {
      benchmark: String((ownerState && ownerState.benchmark) || "unavailable"),
      selected: selectedId,
      usdShock: usdShock,
      rateShock: rateShock,
      riskAppetite: riskAppetite,
      volatilityPenalty: volPenalty,
      drawdownLimit: drawdownLimit,
      breadthThreshold: breadthThreshold,
      assetCount: assets.length,
      pricedCount: priced.length,
      driverState: driverState,
      score: score == null ? null : roundTo(score, 4),
      riskState: riskState,
      confirmation: confirmation
    };
  }

  /* ═══════════ real-asset-driver adapter contract wiring ═══════════ */

  function realAssetEvidenceState(ownerState) {
    var assets = (ownerState && Array.isArray(ownerState.assets)) ? ownerState.assets : [];
    var priced = 0;
    assets.forEach(function (asset) { if (isFiniteNumber(asset.ownerScore)) priced++; });
    return priced > 0 ? "ready" : "unavailable";
  }

  function buildRealAssetEvidence(api, ownerState) {
    var state = realAssetEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "real-assets-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:real-assets-lab:driver-scenario:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The driver scenario uses only the frozen owner score, volatility, drawdown, driver deltas, and breadth returns currently captured."
      ],
      limitations: [
        "The driver scenario describes the selected owner asset under bounded shocks and does not establish an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses an asset, or a later observation replaces the current window."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function realAssetOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.assetCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.assetCount +
      " assets carry a complete owner model score.";
    var uncertaintyState = summary.pricedCount >= 2 ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: "Driver " + summary.driverState.state + " / risk " + summary.riskState.state,
        reason: "Driver state, score, risk state, and confirmation use the exact frozen owner score, volatility, drawdown, driver deltas, and breadth facts currently captured."
      },
      assumptions: [
        "Assets without a complete owner model score are excluded from the priced coverage."
      ],
      limitations: [
        "The driver scenario describes the selected owner asset under bounded shocks and does not establish an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later observation replaces the current window."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the real-asset-driver parameters. Mirrors simple-models.json exactly. */
  var REAL_ASSET_OUTPUT_PATHS = {
    "usd-shock": ["summary.driverState"],
    "rate-shock": ["summary.driverState"],
    "risk-appetite": ["summary.driverState"],
    "volatility-penalty": ["summary.score"],
    "drawdown-limit": ["summary.riskState"],
    "breadth-threshold": ["summary.confirmation"]
  };

  function realAssetSummaryPath(summary, path) {
    if (path === "summary.driverState") return summary.driverState;
    if (path === "summary.score") return summary.score;
    if (path === "summary.riskState") return summary.riskState;
    if (path === "summary.confirmation") return summary.confirmation;
    return null;
  }

  function createRealAssetDriverAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.assets)) {
          return { ok: false, error: { reason: "real-asset owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildRealAssetEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeRealAssetDriverSummary(ownerState, paramMap(input));
        return { ok: true, value: realAssetOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeRealAssetDriverSummary(ownerState, baselineValues);
        var currentSummary = computeRealAssetDriverSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = REAL_ASSET_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, realAssetSummaryPath(baselineSummary, path)) !== fingerprintOf(api, realAssetSummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner snapshot yields an identical value on these paths for this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.selected + " drivers " + summary.driverState.state,
            numericValue: summary.score,
            unit: "model-score",
            summary: summary.selected + " reads " + summary.driverState.state +
              " under the selected shocks (" + summary.confirmation.state + " commodity breadth, benchmark " + summary.benchmark + ").",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ fixed-income-sleeve Simple model (owner seam = bond-regime-lab.html) ═══════════
     The adapter is a DIFFERENT Simple question over FROZEN owner facts the page computes: a generic
     sleeve-response SCENARIO across the frozen sleeves under one shared carry/convexity assumption and
     a rate/spread shock, ranked by total return, plus an inflation/real-yield REGIME confirmation. It
     consumes the page's already-computed per-sleeve owner characteristics (rate duration, spread
     duration, convexity, shock kinds) and the frozen inflation/credit regime facts, and re-derives
     outcomes under the adapter's own controls. The sleeve total-return decomposition owner formula is
     single-sourced here so the page's calculateScenarioResult and this Simple adapter share ONE
     decomposition (the page carries no inline convexity/total formula). Everything else is a frozen
     owner fact — the adapter fabricates nothing and defaults nothing for missing evidence. */

  /* sleeveTotalReturn: the owner carry + rate + spread + convexity total-return decomposition for one
     generic sleeve response. SINGLE SOURCE — bond-regime-lab.html calculateScenarioResult delegates its
     inline decomposition to this exact function. Byte-identical to the former page body: carry =
     pctToDecimal(carry)·horizon/12, rate = −rateDuration·bpToDecimal(rateShock), spread (null when the
     sleeve bears no credit spread) = −spreadDuration·bpToDecimal(spreadShock), convexity =
     0.5·convexity·combinedShock², total = carry + rate + (spread||0) + convexity. Uses the page's exact
     finiteNumber/bpToDecimal/pctToDecimal guards so a missing characteristic leaves the total non-finite
     (an unpriced sleeve), never a fabricated fill. */
  function sleeveTotalReturn(carryPctAnnual, rateDurationYears, spreadDurationYears, convexityYearsSquared, horizonMonths, rateShockBp, spreadShockBp) {
    function fin(value) {
      if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return null;
      var number = Number(value);
      return Number.isFinite(number) ? number : null;
    }
    function bpDec(value) { value = fin(value); return value === null ? null : value / 10000; }
    function pctDec(value) { value = fin(value); return value === null ? null : value / 100; }
    var rateShock = bpDec(rateShockBp);
    var spreadShock = spreadShockBp === null ? 0 : bpDec(spreadShockBp);
    var carryDec = pctDec(carryPctAnnual);
    var rateDuration = fin(rateDurationYears);
    var spreadDuration = fin(spreadDurationYears);
    var convexity = fin(convexityYearsSquared);
    var horizon = fin(horizonMonths);
    var carry = (carryDec === null || horizon === null) ? NaN : carryDec * horizon / 12;
    var rate = (rateDuration === null || rateShock === null) ? NaN : -rateDuration * rateShock;
    var spread = spreadShockBp === null ? null : ((spreadDuration === null || spreadShock === null) ? NaN : -spreadDuration * spreadShock);
    var combinedShock = (rateShock === null ? 0 : rateShock) + (spreadShock === null ? 0 : spreadShock);
    var convexityTerm = convexity === null ? NaN : 0.5 * convexity * combinedShock * combinedShock;
    var total = carry + rate + (spread || 0) + convexityTerm;
    return { carry: carry, rate: rate, spread: spread, convexity: convexityTerm, combinedShock: combinedShock, total: total };
  }

  /* Compute the full fixed-income-sleeve summary from frozen owner state + current parameters. Every
     sleeve outcome derives from the single-source sleeveTotalReturn under one shared carry/convexity
     assumption and the rate/spread shock; the regime read shifts the frozen inflation/credit facts by
     the inflation/real-yield shocks and scores them against the confirmation threshold. Nothing is
     fabricated and missing evidence never becomes a default. */
  function computeFixedIncomeSleeveSummary(ownerState, params) {
    var horizonDays = params["horizon"];
    var rateShock = params["rate-shock"];
    var spreadShock = params["spread-shock"];
    var carry = params["carry"];
    var convexity = params["convexity"];
    var inflationShock = params["inflation-shock"];
    var realYieldShock = params["real-yield-shock"];
    var confirmationThreshold = params["confirmation-threshold"];
    var horizonMonths = isFiniteNumber(horizonDays) ? horizonDays / 30 : null;
    var sleeves = (ownerState && Array.isArray(ownerState.sleeves)) ? ownerState.sleeves : [];
    var regimeFacts = (ownerState && ownerState.regime && typeof ownerState.regime === "object") ? ownerState.regime : {};

    var computed = sleeves.map(function (sleeve) {
      var spreadShockBp = String(sleeve.spreadShockKind) === "none" ? null : spreadShock;
      var decomposition = sleeveTotalReturn(carry, sleeve.rateDuration, sleeve.spreadDuration, convexity, horizonMonths, rateShock, spreadShockBp);
      var priced = isFiniteNumber(decomposition.total);
      return {
        id: String(sleeve.id),
        label: String(sleeve.label || sleeve.id),
        carry: priced ? roundTo(decomposition.carry, 6) : null,
        rate: priced ? roundTo(decomposition.rate, 6) : null,
        spread: decomposition.spread == null ? null : (priced ? roundTo(decomposition.spread, 6) : null),
        convexity: priced ? roundTo(decomposition.convexity, 6) : null,
        total: priced ? roundTo(decomposition.total, 6) : null,
        priced: priced
      };
    });

    var outcomes = computed.slice().sort(function (a, b) {
      var d = (b.total == null ? -Infinity : b.total) - (a.total == null ? -Infinity : a.total);
      if (d !== 0) return d;
      return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
    });
    var priced = computed.filter(function (entry) { return entry.priced; });

    // Regime: the frozen inflation/credit facts shifted by the user inflation/real-yield shocks, scored
    // against the confirmation threshold. A missing frozen fact stays null (unavailable), never a fill.
    var realYieldBase = isFiniteNumber(regimeFacts.realYieldChangeBp) ? regimeFacts.realYieldChangeBp : null;
    var breakevenBase = isFiniteNumber(regimeFacts.breakevenChangeBp) ? regimeFacts.breakevenChangeBp : null;
    var creditConfirmation = isFiniteNumber(regimeFacts.creditConfirmation) ? regimeFacts.creditConfirmation : null;
    var realYield = realYieldBase == null ? null : realYieldBase + (isFiniteNumber(realYieldShock) ? realYieldShock : 0);
    var breakeven = breakevenBase == null ? null : breakevenBase + (isFiniteNumber(inflationShock) ? inflationShock : 0);
    var confirmationScore = null;
    if (creditConfirmation != null) {
      var realYieldTilt = realYield == null ? 0 : Math.max(-1, Math.min(1, realYield / 50));
      var breakevenTilt = breakeven == null ? 0 : Math.max(-1, Math.min(1, breakeven / 50));
      confirmationScore = Math.max(0, Math.min(1, creditConfirmation + 0.25 * realYieldTilt - 0.25 * breakevenTilt));
    }
    var regime = {
      confirmationThreshold: confirmationThreshold,
      realYield: realYield == null ? null : roundTo(realYield, 4),
      breakeven: breakeven == null ? null : roundTo(breakeven, 4),
      creditConfirmation: creditConfirmation == null ? null : roundTo(creditConfirmation, 4),
      confirmationScore: confirmationScore == null ? null : roundTo(confirmationScore, 6),
      state: confirmationScore == null ? "unavailable" : (confirmationScore >= confirmationThreshold ? "confirmed" : "unconfirmed"),
      margin: confirmationScore == null ? null : roundTo(confirmationScore - confirmationThreshold, 6)
    };

    return {
      horizonDays: horizonDays,
      horizonMonths: horizonMonths == null ? null : roundTo(horizonMonths, 6),
      rateShock: rateShock,
      spreadShock: spreadShock,
      carry: carry,
      convexity: convexity,
      inflationShock: inflationShock,
      realYieldShock: realYieldShock,
      confirmationThreshold: confirmationThreshold,
      sleeveCount: computed.length,
      pricedCount: priced.length,
      outcomes: outcomes,
      regime: regime
    };
  }

  /* ═══════════ fixed-income-sleeve adapter contract wiring ═══════════ */

  function fixedIncomeEvidenceState(ownerState) {
    var sleeves = (ownerState && Array.isArray(ownerState.sleeves)) ? ownerState.sleeves : [];
    var priced = 0;
    sleeves.forEach(function (sleeve) {
      var spreadOk = String(sleeve.spreadShockKind) === "none" || isFiniteNumber(sleeve.spreadDuration);
      if (isFiniteNumber(sleeve.rateDuration) && isFiniteNumber(sleeve.convexity) && spreadOk) priced++;
    });
    return priced > 0 ? "ready" : "unavailable";
  }

  function buildFixedIncomeEvidence(api, ownerState) {
    var state = fixedIncomeEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "bond-regime-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:bond-regime-lab:sleeve-scenario:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The sleeve scenario uses only the frozen owner sleeve characteristics and inflation/credit regime facts currently captured."
      ],
      limitations: [
        "The sleeve scenario is a local carry/rate/spread/convexity approximation and does not model non-parallel curves, defaults, or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses a sleeve, or a later observation replaces the current characteristics."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function fixedIncomeOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.sleeveCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.sleeveCount +
      " sleeves carry complete owner rate/spread/convexity characteristics.";
    var uncertaintyState = summary.pricedCount >= 2 ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    var leader = summary.outcomes.length ? summary.outcomes[0].id : null;
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: (leader ? ("Leader " + leader) : "No priced sleeve") + " / regime " + summary.regime.state,
        reason: "Sleeve outcomes and the regime confirmation use the exact frozen owner sleeve characteristics and inflation/credit facts currently captured."
      },
      assumptions: [
        "Sleeves without complete owner rate/spread/convexity characteristics are excluded from the priced outcomes."
      ],
      limitations: [
        "The sleeve scenario is a local carry/rate/spread/convexity approximation and does not model non-parallel curves, defaults, or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later observation replaces the current characteristics."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the fixed-income-sleeve parameters. Mirrors simple-models.json exactly. */
  var FIXED_INCOME_OUTPUT_PATHS = {
    "horizon": ["summary.outcomes"],
    "rate-shock": ["summary.outcomes"],
    "spread-shock": ["summary.outcomes"],
    "carry": ["summary.outcomes"],
    "convexity": ["summary.outcomes"],
    "inflation-shock": ["summary.regime"],
    "real-yield-shock": ["summary.regime"],
    "confirmation-threshold": ["summary.regime"]
  };

  function fixedIncomeSummaryPath(summary, path) {
    if (path === "summary.outcomes") return summary.outcomes;
    if (path === "summary.regime") return summary.regime;
    return null;
  }

  var FX_VEHICLE_OUTPUT_PATHS = {
    "horizon": ["summary.evaluations"],
    "vehicle-class": ["summary.evaluations"],
    "daily-reset": ["summary.evaluations"]
  };

  /* The FX owner decision is already settled by rlfx.js. This adapter PROJECTS it — it never
     re-evaluates a vehicle, and an unavailable owner state stays unavailable. */
  function fxVehicleSummary(ownerState) {
    var fit = (ownerState && ownerState.vehicleFit) || {};
    var evaluations = Array.isArray(fit.evaluations) ? fit.evaluations : [];
    return {
      state: fit.state || "Unavailable",
      selectedVehicleId: fit.selected ? fit.selected.vehicleId : null,
      evaluationCount: evaluations.length,
      eligibleCount: evaluations.filter(function (e) { return e.state === "Eligible"; }).length,
      evaluations: evaluations.map(function (e) {
        return { vehicleId: e.vehicleId, ticker: e.ticker, state: e.state, reasonCodes: (e.reasonCodes || []).slice() };
      })
    };
  }

  function buildFxVehicleEvidence(api, ownerState) {
    var cutoff = String((ownerState && ownerState.evidenceCutoff) || "unavailable");
    var ready = ownerState && ownerState.state === "ready";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "fx-regime-relative-value-lab",
      state: ready ? "ready" : "unavailable",
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:fx-regime-relative-value-lab:vehicle-fit:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: "reviewed-configuration",
        valueState: ready ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Every disposition is the frozen owner vehicle-fit evaluation captured for this cutoff."
      ],
      limitations: [
        "The vehicle fit describes eligibility under the owner's active constraints and establishes no expected return."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses a registry vehicle, or a later evaluation replaces the current fit."
      ],
      evidenceIdentity: null
    };
    // Computed over the COMPLETE evidence, so the identity covers the declared assumptions too.
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function fxVehicleOutput(input, summary) {
    var ready = summary.state !== "Unavailable";
    var values = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: ready ? "ready" : "unavailable",
      values: values,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: ready ? "ready" : "unavailable", values: values };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: summary.eligibleCount + " of " + summary.evaluationCount + " registry vehicles are eligible under the active constraints."
      },
      provenance: { classes: ["observed-fact"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: ready ? "bounded" : "wide",
        rangeOrBand: summary.selectedVehicleId ? ("Selected " + summary.selectedVehicleId) : "No vehicle selected",
        reason: "Every disposition is the frozen owner evaluation for that registry member; no constraint is relaxed to produce one."
      },
      assumptions: [
        "Every disposition is the frozen owner vehicle-fit evaluation captured for this cutoff."
      ],
      limitations: [
        "The vehicle fit describes eligibility under the owner's active constraints and establishes no expected return."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses a registry vehicle, or a later evaluation replaces the current fit."
      ],
      flatRegionProofs: []
    };
  }

  function createFxCurrencyVehicleAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !ownerState.vehicleFit) {
          return { ok: false, error: { reason: "FX owner decision with a vehicle fit is required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildFxVehicleEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        return { ok: true, value: fxVehicleOutput(input, fxVehicleSummary(ownerState)) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var summary = fxVehicleSummary(ownerState);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = FX_VEHICLE_OUTPUT_PATHS[parameterId] || [];
          /* The owner decision is frozen, so a control change cannot move it here. That is the
             honest result, not a missing effect — the flat-region proof states exactly why. */
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: "changed",
            magnitude: 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: false,
            flatRegionProof: {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The owner decision is frozen for this evidence identity, and every registry member is " + summary.state + " under it, so this parameter cannot change the projection."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.selectedVehicleId ? (summary.selectedVehicleId + " selected") : "No vehicle selected",
            numericValue: summary.eligibleCount,
            unit: "eligible-vehicle-count",
            summary: summary.selectedVehicleId
              ? (summary.selectedVehicleId + " is the owner-selected vehicle; " + summary.eligibleCount + " of " + summary.evaluationCount + " registry vehicles are eligible under the active constraints.")
              : (summary.eligibleCount + " of " + summary.evaluationCount + " registry vehicles are eligible and the owner selected none."),
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  function createFixedIncomeSleeveAdapter(api, definition, ownerByIdentity) {    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.sleeves)) {
          return { ok: false, error: { reason: "fixed-income sleeve owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildFixedIncomeEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeFixedIncomeSleeveSummary(ownerState, paramMap(input));
        return { ok: true, value: fixedIncomeOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeFixedIncomeSleeveSummary(ownerState, baselineValues);
        var currentSummary = computeFixedIncomeSleeveSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = FIXED_INCOME_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, fixedIncomeSummaryPath(baselineSummary, path)) !== fingerprintOf(api, fixedIncomeSummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner snapshot yields an identical value on these paths for this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        var leader = summary.outcomes.length ? summary.outcomes[0] : null;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: leader ? (leader.id + " leads sleeve outcomes") : "No priced sleeve",
            numericValue: leader && leader.total != null ? leader.total : null,
            unit: "total-return-decimal",
            summary: leader
              ? (leader.id + " leads the sleeve scenario; the inflation/real-yield regime is " + summary.regime.state + ".")
              : "No sleeve prices under the selected owner characteristics.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ etf-ranking Simple model (owner seam = etf-momentum-lab.html) ═══════════
     The adapter is a DIFFERENT Simple question over FROZEN owner facts the page computes: a
     horizon-and-risk-weighted RANKING of the frozen momentum-ETF universe, a benchmark-relative
     PERFORMANCE read (excess window CAGR versus the selected public benchmark), and a capped BASKET
     projection. It consumes the page's already-computed per-fund owner metrics (the trailing-return
     ladder, realized volatility, max drawdown, window CAGR) and re-ranks them under the adapter's own
     controls. The horizon momentum owner formula is single-sourced here so the page's Simple cockpit
     (etfSimpleSignal/etfSimpleScore) and this adapter share ONE momentum/composite primitive (the page
     carries no inline momentum-blend or composite-score formula). Everything else is a frozen owner
     fact — the adapter fabricates nothing and defaults nothing for missing evidence. */

  /* etfMomentumSignal: the owner horizon-momentum signal. A specific horizon key returns that trailing
     return; 'blend' averages the 3M/6M/1Y relatives. SINGLE SOURCE — etf-momentum-lab.html etfSimpleSignal
     delegates to this exact function. Byte-identical to the former page body (uses Number.isFinite, never
     the global isFinite) so a missing trailing return stays null (never a fabricated fill). */
  function etfMomentumSignal(m, signal) {
    if (!m) return null;
    if (signal === "blend") {
      var values = ["3M", "6M", "1Y"].map(function (key) { return m.trailing && m.trailing[key]; }).filter(function (value) { return Number.isFinite(value); });
      return values.length ? values.reduce(function (sum, value) { return sum + value; }, 0) / values.length : null;
    }
    return m.trailing && Number.isFinite(m.trailing[signal]) ? m.trailing[signal] : null;
  }

  /* etfCompositeScore: the owner composite ranking score — raw preserves the momentum; balanced and
     defensive blend the momentum with a clamped Sharpe and a clamped low-volatility quality at the owner
     weights. SINGLE SOURCE — etf-momentum-lab.html etfSimpleScore delegates to this exact function.
     Byte-identical to the former page body (clamps + 0.70/0.20/0.10 balanced, 0.45/0.30/0.25 defensive). */
  function etfCompositeScore(m, signal, riskMode) {
    var momentum = etfMomentumSignal(m, signal);
    if (!Number.isFinite(momentum)) return null;
    if (riskMode === "raw") return momentum;
    var sharpe = Number.isFinite(m.sharpe) ? Math.max(-1, Math.min(1, m.sharpe / 2)) : 0;
    var quality = Number.isFinite(m.annVol) ? Math.max(-1, Math.min(1, (0.30 - m.annVol) / 0.22)) : 0;
    return riskMode === "defensive" ? momentum * 0.45 + sharpe * 0.30 + quality * 0.25 : momentum * 0.70 + sharpe * 0.20 + quality * 0.10;
  }

  /* etfHorizonKey: map the adapter's horizon enum (1m/3m/6m/12m) to the owner trailing-return key. An
     unrecognized horizon yields null so the momentum signal stays unavailable (never a default fill). */
  function etfHorizonKey(horizon) {
    var map = { "1m": "1M", "3m": "3M", "6m": "6M", "12m": "1Y" };
    return Object.prototype.hasOwnProperty.call(map, String(horizon)) ? map[String(horizon)] : null;
  }

  /* etfRiskComponent: the frozen owner risk load for one fund — realized volatility plus the absolute
     max drawdown. A missing owner metric contributes zero (it is simply absent), never a fabricated fill. */
  function etfRiskComponent(fund) {
    var vol = isFiniteNumber(fund && fund.annVol) ? fund.annVol : 0;
    var dd = isFiniteNumber(fund && fund.maxDD) ? Math.abs(fund.maxDD) : 0;
    return vol + dd;
  }

  /* Compute the full etf-ranking summary from frozen owner state + current parameters. The ranking
     derives from the single-source horizon momentum minus the frozen risk load under the caller's
     momentum/risk weights; the relative performance is each fund's frozen window CAGR minus the selected
     benchmark's frozen CAGR; the basket weights the ranked funds equal or by shifted rank score, each
     capped at the constituent cap. Nothing is fabricated and missing evidence never becomes a default. */
  function computeEtfRankingSummary(ownerState, params) {
    var horizon = params["horizon"];
    var momentumWeight = params["momentum-weight"];
    var riskPenalty = params["risk-penalty"];
    var benchmark = params["benchmark"];
    var weighting = params["weighting"];
    var maxConstituentWeight = params["max-constituent-weight"];
    var horizonKey = etfHorizonKey(horizon);
    var funds = (ownerState && Array.isArray(ownerState.funds)) ? ownerState.funds : [];
    var benchmarks = (ownerState && ownerState.benchmarks && typeof ownerState.benchmarks === "object") ? ownerState.benchmarks : {};

    var views = funds.map(function (fund) {
      var momentum = horizonKey ? etfMomentumSignal(fund, horizonKey) : null;
      var priced = isFiniteNumber(momentum);
      var riskComponent = etfRiskComponent(fund);
      var score = priced ? (momentumWeight * momentum - riskPenalty * riskComponent) : null;
      return {
        ticker: String(fund.ticker),
        momentum: priced ? roundTo(momentum, 6) : null,
        riskComponent: roundTo(riskComponent, 6),
        score: priced ? roundTo(score, 6) : null,
        cagr: isFiniteNumber(fund.cagr) ? fund.cagr : null,
        priced: priced
      };
    });

    var priced = views.filter(function (view) { return view.priced; });

    // Ranking: the priced funds sorted by score desc (stable by ticker).
    var ranking = priced.map(function (view) {
      return { ticker: view.ticker, momentum: view.momentum, riskComponent: view.riskComponent, score: view.score };
    }).sort(function (a, b) {
      var d = (b.score == null ? -Infinity : b.score) - (a.score == null ? -Infinity : a.score);
      if (d !== 0) return d;
      return a.ticker < b.ticker ? -1 : (a.ticker > b.ticker ? 1 : 0);
    });

    // Relative performance: each fund's frozen window CAGR minus the selected benchmark's frozen CAGR.
    // A missing benchmark or a missing fund CAGR stays null (unavailable), never a fabricated excess.
    var benchState = benchmarks[benchmark] && typeof benchmarks[benchmark] === "object" ? benchmarks[benchmark] : null;
    var benchCagr = benchState && isFiniteNumber(benchState.cagr) ? benchState.cagr : null;
    var relativePerformance = {
      benchmark: String(benchmark),
      benchmarkCagr: benchCagr == null ? null : roundTo(benchCagr, 6),
      funds: views.map(function (view) {
        var excess = (view.cagr == null || benchCagr == null) ? null : view.cagr - benchCagr;
        return { ticker: view.ticker, excess: excess == null ? null : roundTo(excess, 6) };
      })
    };

    // Basket: the ranked funds weighted equal or by shifted rank score (score minus the lowest rank
    // score, so every weight is positive), each capped at the constituent cap. The uncapped rawWeight
    // and the capped weight are both reported so both the weighting scheme and the cap are visible.
    var rankedCount = ranking.length;
    var minScore = rankedCount ? ranking[rankedCount - 1].score : 0;
    var shifted = ranking.map(function (row) { return (row.score - minScore) + 1e-6; });
    var shiftedSum = shifted.reduce(function (sum, value) { return sum + value; }, 0);
    var constituents = ranking.map(function (row, index) {
      var rawWeight = weighting === "equal"
        ? (rankedCount ? 1 / rankedCount : 0)
        : (shiftedSum > 0 ? shifted[index] / shiftedSum : 0);
      var weight = Math.min(rawWeight, maxConstituentWeight);
      return { ticker: row.ticker, rawWeight: roundTo(rawWeight, 6), weight: roundTo(weight, 6) };
    });
    var investedWeight = constituents.reduce(function (sum, constituent) { return sum + (constituent.weight == null ? 0 : constituent.weight); }, 0);
    var basket = {
      weighting: String(weighting),
      maxConstituentWeight: maxConstituentWeight,
      constituents: constituents,
      investedWeight: roundTo(investedWeight, 6)
    };

    return {
      horizon: String(horizon),
      horizonKey: horizonKey,
      momentumWeight: momentumWeight,
      riskPenalty: riskPenalty,
      benchmark: String(benchmark),
      weighting: String(weighting),
      maxConstituentWeight: maxConstituentWeight,
      fundCount: views.length,
      pricedCount: priced.length,
      ranking: ranking,
      relativePerformance: relativePerformance,
      basket: basket
    };
  }

  /* ═══════════ etf-ranking adapter contract wiring ═══════════ */

  function etfEvidenceState(ownerState) {
    var funds = (ownerState && Array.isArray(ownerState.funds)) ? ownerState.funds : [];
    var keys = ["1M", "3M", "6M", "1Y"];
    var priced = 0;
    funds.forEach(function (fund) {
      var trailing = fund && fund.trailing && typeof fund.trailing === "object" ? fund.trailing : {};
      if (keys.some(function (key) { return isFiniteNumber(trailing[key]); })) priced++;
    });
    return priced > 0 ? "ready" : "unavailable";
  }

  function buildEtfEvidence(api, ownerState) {
    var state = etfEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "etf-momentum-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:etf-momentum-lab:ranking:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "shared cache snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The ranking uses only the frozen owner per-fund trailing-return, volatility, drawdown, and window-CAGR metrics currently captured."
      ],
      limitations: [
        "The ranking is a local momentum/risk read over the frozen owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses a fund, or a later observation replaces the current metrics."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function etfRankingOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.fundCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.fundCount +
      " funds carry a complete owner trailing-return window at the selected horizon.";
    var uncertaintyState = summary.pricedCount >= 2 ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    var leader = summary.ranking.length ? summary.ranking[0].ticker : null;
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: (leader ? ("Leader " + leader) : "No priced fund") + " / benchmark " + summary.benchmark,
        reason: "The ranking, relative performance, and basket use the exact frozen owner per-fund metrics currently captured."
      },
      assumptions: [
        "Funds without a complete owner trailing-return window at the selected horizon are excluded from the ranking and basket."
      ],
      limitations: [
        "The ranking is a local momentum/risk read over the frozen owner window and does not establish persistence or an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later observation replaces the current metrics."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the etf-ranking parameters. Mirrors simple-models.json exactly. */
  var ETF_OUTPUT_PATHS = {
    "horizon": ["summary.ranking"],
    "momentum-weight": ["summary.ranking"],
    "risk-penalty": ["summary.ranking"],
    "benchmark": ["summary.relativePerformance"],
    "weighting": ["summary.basket"],
    "max-constituent-weight": ["summary.basket"]
  };

  function etfSummaryPath(summary, path) {
    if (path === "summary.ranking") return summary.ranking;
    if (path === "summary.relativePerformance") return summary.relativePerformance;
    if (path === "summary.basket") return summary.basket;
    return null;
  }

  function createEtfRankingAdapter(api, definition, ownerByIdentity) {
    return {
      contractVersion: "simple-model-adapter/v1",
      adapterId: definition.adapterId,
      supportedDefinitionIds: [definition.definitionId],
      validateDefinition: function (candidate) {
        return { ok: true, value: candidate };
      },
      captureEvidence: function (ownerContext) {
        if (!ownerContext || typeof ownerContext !== "object") {
          return { ok: false, error: { reason: "owner context required" } };
        }
        var ownerState = ownerContext.ownerState;
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.funds)) {
          return { ok: false, error: { reason: "etf ranking owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildEtfEvidence(api, frozen);
        ownerByIdentity.set(evidence.evidenceIdentity, frozen);
        return { ok: true, value: evidence };
      },
      normalizeInputs: function (candidate, evidence, parameterValues, seed, scenarioIds) {
        return api.normalizeSimpleInput(candidate, evidence, parameterValues, seed, scenarioIds);
      },
      compute: function (input) {
        var ownerState = ownerByIdentity.get(input.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for this evidence identity" } };
        }
        var summary = computeEtfRankingSummary(ownerState, paramMap(input));
        return { ok: true, value: etfRankingOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeEtfRankingSummary(ownerState, baselineValues);
        var currentSummary = computeEtfRankingSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = ETF_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, etfSummaryPath(baselineSummary, path)) !== fingerprintOf(api, etfSummaryPath(currentSummary, path));
          });
          effects.push({
            parameterId: parameterId,
            oldValue: baselineValues[parameterId],
            newValue: currentValues[parameterId],
            direction: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (currentValues[parameterId] > baselineValues[parameterId] ? "higher" : "lower")
              : "changed",
            magnitude: (typeof currentValues[parameterId] === "number" && typeof baselineValues[parameterId] === "number")
              ? (Math.abs(currentValues[parameterId] - baselineValues[parameterId]) || 1)
              : 1,
            nonlinear: false,
            resultPaths: paths,
            outputChanged: changed,
            flatRegionProof: changed ? null : {
              parameterId: parameterId,
              resultPaths: paths,
              reason: "The frozen owner snapshot yields an identical value on these paths for this parameter change."
            }
          });
        });
        return {
          ok: true,
          value: {
            contractVersion: "simple-sensitivity/v1",
            sharedRandomness: sharedRandomness,
            seedChanged: baselineInput.seed !== currentInput.seed,
            effects: effects
          }
        };
      },
      projectOwnerEvidence: function (output) {
        var summary = output.values.summary;
        var leader = summary.ranking.length ? summary.ranking[0] : null;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: leader ? (leader.ticker + " leads the ranking") : "No priced fund",
            numericValue: leader && leader.score != null ? leader.score : null,
            unit: "rank-score",
            summary: leader
              ? (leader.ticker + " leads the momentum/risk ranking (benchmark " + summary.benchmark + ").")
              : "No fund prices under the selected owner window.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* Factory: returns the macro-rotation Simple adapters implemented at genuine owner-parity, keyed
     by their exact declared adapter ID. Tools whose owner seam is not yet extracted are absent so
     the shared runtime renders the explicit unavailable state for them. */
  function createMacroRotationAdapters(api, definitions, deps) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLMACROROTATION_REQUIRES_RLEXPERIENCE_API");
    }
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (byToolId["sector-research-lab"]) {
      var sectorDefinition = byToolId["sector-research-lab"];
      adapters[sectorDefinition.adapterId] = createSectorRotationAdapter(api, sectorDefinition, ownerByIdentity);
    }
    if (byToolId["global-rotation-lab"]) {
      var countryDefinition = byToolId["global-rotation-lab"];
      adapters[countryDefinition.adapterId] = createCountryRotationAdapter(api, countryDefinition, ownerByIdentity);
    }
    if (byToolId["real-assets-lab"]) {
      var realAssetDefinition = byToolId["real-assets-lab"];
      adapters[realAssetDefinition.adapterId] = createRealAssetDriverAdapter(api, realAssetDefinition, ownerByIdentity);
    }
    if (byToolId["bond-regime-lab"]) {
      var fixedIncomeDefinition = byToolId["bond-regime-lab"];
      adapters[fixedIncomeDefinition.adapterId] = createFixedIncomeSleeveAdapter(api, fixedIncomeDefinition, ownerByIdentity);
    }
    if (byToolId["etf-momentum-lab"]) {
      var etfDefinition = byToolId["etf-momentum-lab"];
      adapters[etfDefinition.adapterId] = createEtfRankingAdapter(api, etfDefinition, ownerByIdentity);
    }
    if (byToolId["fx-regime-relative-value-lab"]) {
      var fxDefinition = byToolId["fx-regime-relative-value-lab"];
      adapters[fxDefinition.adapterId] = createFxCurrencyVehicleAdapter(api, fxDefinition, ownerByIdentity);
    }
    return adapters;
  }

  /* Register every implemented macro-rotation adapter with a live shared runtime. Returns the
     per-adapter registration result so the caller can surface honest registration failures. */
  function registerMacroRotationAdapters(runtime, api, definitions, deps) {
    var adapters = createMacroRotationAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "macro-rotation-adapters/v1",
    module: "rlexperience-adapters/macro-rotation.js",
    supportedAdapterIds: ["simple-adapter/sector-rotation-transition/v1", "simple-adapter/country-rotation/v1", "simple-adapter/real-asset-driver/v1", "simple-adapter/fixed-income-sleeve/v1", "simple-adapter/etf-ranking/v1", "simple-adapter/fx-currency-vehicle/v1"],
    rollZ100: rollZ100,
    rrgQuadrant: rrgQuadrant,
    stateLabel: stateLabel,
    backVal: backVal,
    rotationCandidacy: rotationCandidacy,
    rrgReadout: rrgReadout,
    normList: normList,
    computeSectorRotationSummary: computeSectorRotationSummary,
    globalPairCorrelation: globalPairCorrelation,
    countryHorizonMomentum: countryHorizonMomentum,
    computeCountryRotationSummary: computeCountryRotationSummary,
    realBreadthPct: realBreadthPct,
    realAssetDriverScenario: realAssetDriverScenario,
    computeRealAssetDriverSummary: computeRealAssetDriverSummary,
    sleeveTotalReturn: sleeveTotalReturn,
    computeFixedIncomeSleeveSummary: computeFixedIncomeSleeveSummary,
    etfMomentumSignal: etfMomentumSignal,
    etfCompositeScore: etfCompositeScore,
    computeEtfRankingSummary: computeEtfRankingSummary,
    createMacroRotationAdapters: createMacroRotationAdapters,
    registerMacroRotationAdapters: registerMacroRotationAdapters
  };
});
