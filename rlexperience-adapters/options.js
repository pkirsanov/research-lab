/*
 * rlexperience-adapters/options.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 05 — Options Simple adapters.
 *
 * This module is the SINGLE OWNER SOURCE for the options Simple model owner
 * primitives. The owning option tool pages consume the exact same pure owner
 * functions in their Power path (options-flow-feed-lab.html,
 * options-structure-lab.html, gamma-trading-lab.html), and the registered
 * Simple adapters call the same functions — so Simple and Power share one
 * formula and no formula is copied (owner-parity).
 *
 * Adapters are PURE COMPUTE over already-captured, frozen owner state. The
 * owning page performs the same-origin data/options/** snapshot read and hands
 * the adapter an already-parsed, frozen owner chain through captureEvidence.
 * Adapters NEVER fetch, providerFetch, read local credentials, call an LLM, a
 * public publisher, or a private store; they never mutate owner state; and they
 * never import another domain adapter module. Options ownership is unchanged:
 * scripts/fetch-options.mjs and data/options/** stay byte-owned and this scope
 * creates no second scheduled or browser-owned chain producer (SCN-012-016).
 *
 * Registration is by the exact declared adapter IDs from simple-models.json. A
 * tool whose owner seam is not yet extracted is simply absent from the returned
 * adapter set, so the shared runtime renders the Scope 04 explicit "unavailable"
 * truth state for it — never an invented signal or default.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser
 * global RLOPTIONS for the owning pages.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLOPTIONS_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLOPTIONS = api;
})(function () {
  "use strict";

  /* ═══════════ shared numeric helpers ═══════════ */

  function isFiniteNumber(value) { return typeof value === "number" && isFinite(value); }

  function roundTo(value, digits) {
    if (!isFiniteNumber(value)) return null;
    var factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  /* ═══════════ options-flow owner primitives (SINGLE SOURCE; consumed by Power + Simple) ═══════════
     This is the ONE source of the options-flow owner formula. options-flow-feed-lab.html's
     Power path delegates to these functions (RLOPTIONS.*) and the options-anomaly Simple
     adapter calls the same functions — one formula, no copy. Byte/semantic identity is pinned
     by the TP-05-01 owner-parity tests and the scripts/selftest.mjs options.js canary. */

  /* traded volume / open interest; Infinity when OI=0 but volume>0 (brand-new positioning). */
  function volOI(vol, oi) { if (!(oi > 0)) return (vol > 0 ? Infinity : 0); return vol / oi; }

  /* premium notional in $ = volume × mid × 100 (contract multiplier). */
  function premiumNotional(vol, mid) { if (!(vol > 0) || !(mid > 0)) return 0; return vol * mid * 100; }

  /* days-to-expiration from an epoch-seconds expiry vs a reference epoch-ms (default now). */
  function dteFrom(expiryEpochSec, nowMs) {
    if (!isFinite(expiryEpochSec)) return null;
    var now = isFinite(nowMs) ? nowMs : Date.now();
    return Math.round((expiryEpochSec * 1000 - now) / 86400000);
  }

  /* unusual score 0-100 for one strike vs chain context {maxVol,maxPrem}. Blends
     vol/OI (new positioning), volume share, premium share, and IV level. */
  function unusualScore(row, ctx) {
    var vo = volOI(row.volume, row.oi);
    var voS = isFinite(vo) ? Math.min(1, vo / 2) : 1;                 // vol = 2×OI ⇒ full
    var vS = (ctx && ctx.maxVol > 0) ? Math.min(1, row.volume / ctx.maxVol) : 0;
    var pS = (ctx && ctx.maxPrem > 0) ? Math.min(1, row.premium / ctx.maxPrem) : 0;
    var ivS = isFinite(row.iv) ? Math.min(1, Math.max(0, (row.iv - 0.3) / 1.2)) : 0; // 30%→0, 150%→full
    return Math.round(100 * (0.4 * voS + 0.3 * vS + 0.2 * pS + 0.1 * ivS));
  }

  /* parse a Yahoo v7 options JSON into { spot, expiry, rows[] }; null on any shape error. */
  function parseYahooChain(json) {
    try {
      var res = json.optionChain.result[0], q = res.quote || {}, spot = q.regularMarketPrice;
      var opt = res.options && res.options[0]; if (!opt) return null;
      var exp = opt.expirationDate, out = [];
      ["calls", "puts"].forEach(function (side) {
        (opt[side] || []).forEach(function (o) {
          var mid = (isFinite(o.bid) && isFinite(o.ask) && o.ask > 0) ? (o.bid + o.ask) / 2 : o.lastPrice;
          out.push({ type: side === "calls" ? "C" : "P", strike: o.strike, volume: o.volume || 0, oi: o.openInterest || 0, iv: o.impliedVolatility, mid: mid, expiry: exp, spot: spot });
        });
      });
      return { spot: spot, expiry: exp, rows: out };
    } catch (e) { return null; }
  }

  /* score every row of a parsed chain (adds .volOI, .premium, .score, .dte, .ticker). */
  function scoreChain(parsed, ticker, nowMs) {
    if (!parsed || !parsed.rows || !parsed.rows.length) return [];
    var maxVol = 0, maxPrem = 0, i, r;
    for (i = 0; i < parsed.rows.length; i++) { r = parsed.rows[i]; r.premium = premiumNotional(r.volume, r.mid); if (r.volume > maxVol) maxVol = r.volume; if (r.premium > maxPrem) maxPrem = r.premium; }
    var ctx = { maxVol: maxVol, maxPrem: maxPrem };
    for (i = 0; i < parsed.rows.length; i++) { r = parsed.rows[i]; r.ticker = ticker; r.volOI = volOI(r.volume, r.oi); r.dte = dteFrom(r.expiry, nowMs); r.score = unusualScore(r, ctx); }
    return parsed.rows;
  }

  /* one-line tape read from flagged rows: net call vs put premium lean. */
  function tapeRead(rows) {
    var callP = 0, putP = 0, i;
    for (i = 0; i < (rows || []).length; i++) { if (rows[i].type === "C") callP += rows[i].premium; else putP += rows[i].premium; }
    var tot = callP + putP;
    if (!(tot > 0)) return { lean: "n/a", callP: 0, putP: 0, frac: 0 };
    var frac = callP / tot;
    return { lean: frac > 0.6 ? "call-heavy (leaning bullish)" : frac < 0.4 ? "put-heavy (leaning bearish / hedged)" : "balanced", callP: callP, putP: putP, frac: frac };
  }

  /* ═══════════ options-anomaly Simple model (owner seam = options-flow-feed-lab.html) ═══════════
     Given an already-captured, frozen owner chain set (the same-origin data/options
     projection the page hands the adapter), compute the steerable anomaly model whose
     declared output paths are exactly:
       expiry-window                   -> summary.contracts
       volume-open-interest-threshold  -> summary.unusualness
       premium-threshold               -> summary.contracts
       implied-volatility-threshold    -> summary.unusualness
       call-put-aggregation            -> summary.callPutLean
     Every value derives from the pure owner primitives above; nothing is fabricated,
     no trade-side is inferred, and no second chain producer is created. */

  var ANOMALY_OUTPUT_PATHS = {
    "expiry-window": ["summary.contracts"],
    "volume-open-interest-threshold": ["summary.unusualness"],
    "premium-threshold": ["summary.contracts"],
    "implied-volatility-threshold": ["summary.unusualness"],
    "call-put-aggregation": ["summary.callPutLean"]
  };

  /* Working copy of the frozen owner chains scored through the owner primitives.
     The adapter NEVER mutates the frozen owner state — scoreChain mutates only this
     detached clone. WHICH chains/nowMs are used is owner-owned and frozen; the Simple
     parameters only steer the declared window/threshold/aggregation classification. */
  function scoreOwnerChains(ownerState) {
    var nowMs = isFiniteNumber(ownerState.nowMs) ? ownerState.nowMs : null;
    var scored = [];
    (ownerState.chains || []).forEach(function (chain) {
      var parsed = {
        spot: chain.spot,
        expiry: chain.expiry,
        rows: (chain.rows || []).map(function (row) {
          return {
            type: row.type, strike: row.strike, volume: row.volume, oi: row.oi,
            iv: row.iv, mid: row.mid, expiry: row.expiry, spot: chain.spot
          };
        })
      };
      scoreChain(parsed, chain.ticker, nowMs);
      parsed.rows.forEach(function (row) { scored.push(row); });
    });
    return scored;
  }

  function projectContract(row) {
    return {
      ticker: row.ticker,
      type: row.type,
      strike: row.strike,
      dte: row.dte,
      volume: row.volume,
      openInterest: row.oi,
      volOI: isFinite(row.volOI) ? roundTo(row.volOI, 4) : "infinite",
      premium: roundTo(row.premium, 2),
      iv: isFiniteNumber(row.iv) ? roundTo(row.iv * 100, 2) : null,
      score: row.score
    };
  }

  /* Compute the anomaly summary from the frozen owner chains and the current Simple
     parameters. Each declared parameter moves exactly its declared output path. */
  function computeAnomalySummary(ownerState, params) {
    var scored = scoreOwnerChains(ownerState);
    var expiryWindow = params["expiry-window"];
    var premiumThreshold = params["premium-threshold"];
    var volOiThreshold = params["volume-open-interest-threshold"];
    var ivThreshold = params["implied-volatility-threshold"] / 100; // percent → decimal
    var aggregation = params["call-put-aggregation"];

    var inWindow = scored.filter(function (row) {
      return row.dte !== null && row.dte >= 0 && row.dte <= expiryWindow;
    });

    // summary.contracts — steered by expiry-window (in-window) and premium-threshold.
    var flagged = inWindow.filter(function (row) { return row.premium >= premiumThreshold; });
    var ranked = flagged.slice().sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.premium !== a.premium) return b.premium - a.premium;
      return a.ticker < b.ticker ? -1 : (a.ticker > b.ticker ? 1 : (a.strike - b.strike));
    });
    var contracts = {
      count: flagged.length,
      windowDays: expiryWindow,
      premiumThreshold: premiumThreshold,
      top: ranked.slice(0, 8).map(projectContract)
    };

    // summary.unusualness — steered by vol/OI threshold and IV threshold.
    var considered = inWindow.length;
    var cleared = inWindow.filter(function (row) {
      var voClears = row.volOI === Infinity || (isFinite(row.volOI) && row.volOI >= volOiThreshold);
      var ivClears = isFiniteNumber(row.iv) && row.iv >= ivThreshold;
      return voClears && ivClears;
    });
    var maxScore = 0;
    inWindow.forEach(function (row) { if (row.score > maxScore) maxScore = row.score; });
    var unusualness = {
      state: considered > 0 ? "ready" : "unavailable",
      consideredCount: considered,
      clearedCount: cleared.length,
      clearedFraction: considered > 0 ? roundTo(cleared.length / considered, 4) : null,
      volOIThreshold: volOiThreshold,
      ivThresholdPct: roundTo(ivThreshold * 100, 2),
      maxScore: maxScore
    };

    // summary.callPutLean — steered by call-put aggregation mode (no trade-side inference).
    var lean = tapeRead(flagged);
    var callPutLean;
    if (aggregation === "net-premium") {
      var net = lean.callP - lean.putP;
      callPutLean = {
        mode: "net-premium",
        netPremium: roundTo(net, 2),
        lean: net > 0 ? "net call premium" : (net < 0 ? "net put premium" : "balanced"),
        callPremium: roundTo(lean.callP, 2),
        putPremium: roundTo(lean.putP, 2)
      };
    } else {
      callPutLean = {
        mode: "separate",
        lean: lean.lean,
        callPremium: roundTo(lean.callP, 2),
        putPremium: roundTo(lean.putP, 2),
        callFraction: roundTo(lean.frac, 4)
      };
    }

    return {
      contracts: contracts,
      unusualness: unusualness,
      callPutLean: callPutLean,
      params: {
        expiryWindow: expiryWindow,
        premiumThreshold: premiumThreshold,
        volOIThreshold: volOiThreshold,
        ivThresholdPct: roundTo(ivThreshold * 100, 2),
        aggregation: aggregation
      }
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

  /* Compute the Scope 04 simple-evidence-identity/v1 fingerprint for an evidence
     snapshot, matching rlexperience.js simpleEvidenceIdentity EXACTLY. This is
     shared framework infrastructure, not an owner formula. */
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

  /* Count the option contracts carrying a usable owner row so evidence state is
     honest: ready only when the frozen owner chains carry priced contracts. */
  function ownerContractCount(ownerState) {
    var count = 0;
    (ownerState.chains || []).forEach(function (chain) {
      (chain.rows || []).forEach(function (row) {
        if (isFiniteNumber(row.strike) && isFiniteNumber(row.volume)) count += 1;
      });
    });
    return count;
  }

  /* Build a valid simple-evidence-snapshot/v1 from a frozen owner options snapshot. */
  function buildAnomalyEvidence(api, ownerState) {
    var count = ownerContractCount(ownerState);
    var state = count > 0 ? "ready" : "unavailable";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "options-flow-feed-lab",
      state: state,
      evidenceCutoff: ownerState.asOf,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:options-flow-feed-lab:chain:" + ownerState.asOf,
        semanticFingerprint: fingerprintOf(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: ownerState.asOf,
        retrievedOrPublishedAt: ownerState.asOf,
        freshness: "cache-current-for-render",
        dataTier: ownerState.source,
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "Anomaly scoring uses only the same-origin option contracts present in the frozen owner snapshot."
      ],
      limitations: [
        "The anomaly model describes end-of-day unusualness and infers no trade side or forecast."
      ],
      invalidationConditions: [
        "The owner options snapshot changes, gains or loses contracts, or a later same-origin snapshot replaces it."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function anomalyOutput(input, summary) {
    var provenanceClasses = summary.contracts.count < summary.unusualness.consideredCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.contracts.count + " of " + summary.unusualness.consideredCount +
      " in-window contracts clear the current premium threshold.";
    var uncertaintyState = summary.unusualness.consideredCount >= 2 ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: summary.unusualness.state === "ready" ? "ready" : "unavailable",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: summary.unusualness.state === "ready" ? "ready" : "unavailable", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: provenanceClasses, evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: summary.unusualness.clearedCount + " unusual of " + summary.unusualness.consideredCount + " in-window contracts",
        reason: "Unusualness, contracts, and lean use the exact frozen owner chain currently captured."
      },
      assumptions: [
        "Contracts without a usable owner row are excluded from anomaly scoring."
      ],
      limitations: [
        "The anomaly model describes end-of-day unusualness and infers no trade side or forecast."
      ],
      invalidationConditions: [
        "The frozen owner options snapshot changes or a later same-origin snapshot replaces it."
      ],
      flatRegionProofs: []
    };
  }

  function summaryPathAnomaly(summary, path) {
    if (path === "summary.contracts") return summary.contracts;
    if (path === "summary.unusualness") return summary.unusualness;
    if (path === "summary.callPutLean") return summary.callPutLean;
    return null;
  }

  function createOptionsAnomalyAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.chains)) {
          return { ok: false, error: { reason: "owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildAnomalyEvidence(api, frozen);
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
        var summary = computeAnomalySummary(ownerState, paramMap(input));
        return { ok: true, value: anomalyOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeAnomalySummary(ownerState, baselineValues);
        var currentSummary = computeAnomalySummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = ANOMALY_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, summaryPathAnomaly(baselineSummary, path)) !== fingerprintOf(api, summaryPathAnomaly(currentSummary, path));
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
            valueText: summary.unusualness.clearedCount + " unusual contracts",
            numericValue: summary.unusualness.clearedCount,
            unit: "contracts",
            summary: summary.unusualness.clearedCount + " of " + summary.unusualness.consideredCount +
              " in-window contracts clear the unusualness thresholds; premium lean is " + summary.callPutLean.lean + ".",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ options-gamma owner primitives (SINGLE SOURCE; consumed by Power + Simple) ═══════════
     This is the ONE source of the options-gamma owner formula. gamma-trading-lab.html's Power
     path delegates to these functions (RLOPTIONS.*) and the dealer-gamma-playbook Simple
     adapter calls the same functions — one formula, no copy. gammaEnv is the pure, sign-
     parameterized form the page's envOf delegates to (envOf supplies its dealer-flip sign);
     byte/semantic identity is pinned by the TP-05-01 gamma owner-parity tests and the
     scripts/selftest.mjs options.js canary. */

  function isNum(x) { return typeof x === "number" && isFinite(x); }

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* share of the history at or below x, as a 0-100 percentile; null when unusable. */
  function percentileOf(arr, x) { if (!arr || !arr.length || !isNum(x)) return null; var below = 0, n = 0; arr.forEach(function (v) { if (isNum(v)) { n++; if (v <= x) below++; } }); return n ? Math.round(below / n * 100) : null; }

  /* current-day Option Volume Imbalance percentile vs the rolling history; needs >= 3 days. */
  function oviPercentile(hist, snap) { if (!snap || !isNum(snap.oviQty)) return null; var q = hist.map(function (r) { return r.oviQty; }); if (q.length < 3) return null; return percentileOf(q, snap.oviQty); }

  /* OPEX clock: monthly + quarterly third Friday; 14/30-day windows. Verbatim owner math. */
  function thirdFriday(y, m) { var d = new Date(Date.UTC(y, m, 1)), day = d.getUTCDay(), firstFri = 1 + ((5 - day + 7) % 7); return new Date(Date.UTC(y, m, firstFri + 14, 20, 0, 0)); }
  function nextMonthly(now) { var y = now.getUTCFullYear(), m = now.getUTCMonth(), o = thirdFriday(y, m); if (now.getTime() > o.getTime()) { m++; if (m > 11) { m = 0; y++; } o = thirdFriday(y, m); } return o; }
  function nextQuarterly(now) { var y = now.getUTCFullYear(), m = now.getUTCMonth(); for (var k = 0; k < 12; k++) { var mm = (m + k) % 12, yy = y + Math.floor((m + k) / 12); if (mm % 3 === 2) { var o = thirdFriday(yy, mm); if (o.getTime() >= now.getTime()) return o; } } return thirdFriday(y, 11); }
  function opexInfo(now) {
    now = now || new Date();
    var mo = nextMonthly(now), qo = nextQuarterly(now);
    var dMon = Math.max(0, Math.round((mo.getTime() - now.getTime()) / 864e5));
    var dQtr = Math.max(0, Math.round((qo.getTime() - now.getTime()) / 864e5));
    var dNear = Math.min(dMon, dQtr), quarterlyNear = dQtr <= dMon;
    var phase = dNear <= 14 ? "maxpain" : dNear <= 30 ? "shakeout" : "open";
    var dow = now.getUTCDay(); /* 4=Thu,5=Fri */
    return { dMon: dMon, dQtr: dQtr, dNear: dNear, quarterlyNear: quarterlyNear, phase: phase, dow: dow };
  }

  /* Pure, dealer-sign-parameterized form of gamma-trading-lab.html envOf: the gamma
     regime is spot-vs-flip when both are present, else the sign-adjusted net-GEX sign.
     The page reads its dealer-flip toggle; here the sign convention is an explicit
     parameter so Simple can steer it. Semantically identical to the page envOf. */
  function gammaEnv(snap, sign) {
    if (!snap) return "unknown";
    var g = (snap.netGEX == null ? null : snap.netGEX * sign);
    if (isNum(snap.spot) && isNum(snap.flip)) return snap.spot >= snap.flip ? "positive" : "negative";
    if (isNum(g)) return g >= 0 ? "positive" : "negative";
    return "unknown";
  }

  /* ═══════════ dealer-gamma-playbook Simple model (owner seam = gamma-trading-lab.html) ═══════════
     The adapter consumes the FROZEN gamma snapshot the page already produced (computeGamma
     output: spot/netGEX/flip/maxPain/walls/atmIV/ovi/oviQty/oviSig) plus the rolling history,
     and steers the declared output paths — nothing is recomputed from a raw chain here, no
     trading is executed, and the raw parameters live under summary.params (never inside a
     declared path).
       spot-path       -> summary.playbook
       time-to-expiry  -> summary.expirationState
       dealer-sign     -> summary.gammaState
       ovi-threshold   -> summary.oviState
       aggressiveness  -> summary.playbook
       horizon         -> summary.playbook   */

  var GAMMA_OUTPUT_PATHS = {
    "spot-path": ["summary.playbook"],
    "time-to-expiry": ["summary.expirationState"],
    "dealer-sign": ["summary.gammaState"],
    "ovi-threshold": ["summary.oviState"],
    "aggressiveness": ["summary.playbook"],
    "horizon": ["summary.playbook"]
  };

  function dealerSignOf(value) { return value === "customer-short" ? -1 : 1; }

  function computeGammaPlaybookSummary(ownerState, params) {
    var snap = ownerState.snap || {};
    var hist = Array.isArray(ownerState.hist) ? ownerState.hist : [];
    var sign = dealerSignOf(params["dealer-sign"]);
    var regime = gammaEnv(snap, sign);
    var oviPct = oviPercentile(hist, snap);
    var oviThreshold = params["ovi-threshold"];
    var dte = params["time-to-expiry"];
    var spotPath = params["spot-path"];
    var aggr = params["aggressiveness"];
    var horizon = params["horizon"];
    var opex = opexInfo(new Date(isNum(ownerState.nowMs) ? ownerState.nowMs : Date.now()));

    var gammaState = {
      state: regime === "unknown" ? "unavailable" : "ready",
      regime: regime,
      netGEX: roundTo(snap.netGEX, 2),
      signedNetGEX: isFiniteNumber(snap.netGEX) ? roundTo(snap.netGEX * sign, 2) : null,
      flipPresent: isNum(snap.flip)
    };

    var oviState = {
      state: isNum(oviPct) ? "ready" : (isNum(snap.oviSig) ? "ready" : "unavailable"),
      percentile: oviPct,
      emphasized: isNum(oviPct) && oviPct >= oviThreshold,
      oviSig: isNum(snap.oviSig) ? snap.oviSig : null,
      ovi: roundTo(snap.ovi, 4)
    };

    var expPhase = dte <= 14 ? "gamma-pin-window" : dte <= 30 ? "shakeout-window" : "open";
    var expirationState = {
      phase: expPhase,
      nearExpiry: dte <= 5,
      calendar: { monthlyDays: opex.dMon, quarterlyDays: opex.dQtr, calendarPhase: opex.phase }
    };

    // playbook — derived from owner facts (regime, walls, maxPain) and posture params.
    var pinBias = regime === "positive";
    var scenario;
    if (spotPath === "pin") scenario = pinBias ? "pin-to-maxpain" : "range-break-watch";
    else if (spotPath === "uptrend") scenario = pinBias ? "grind-into-call-wall" : "short-gamma-melt-up";
    else scenario = pinBias ? "orderly-pullback-to-put-wall" : "short-gamma-flush";
    var oviHot = isNum(oviPct) && oviPct >= 80;
    var convictionBase = (aggr === "high" ? 2 : aggr === "balanced" ? 1 : 0) + (oviHot ? 1 : 0);
    var conviction = convictionBase >= 3 ? "lean-in" : convictionBase === 2 ? "measured" : convictionBase === 1 ? "patient" : "wait-for-confirmation";
    var hold = horizon === "intraday"
      ? (expPhase === "gamma-pin-window" ? "same-session-fade" : "same-session-momentum")
      : (expPhase === "gamma-pin-window" ? "multi-session-pin" : "multi-session-trend");
    var playbook = {
      scenario: scenario,
      conviction: conviction,
      hold: hold,
      gammaRegime: regime,
      keyLevels: {
        maxPain: isFiniteNumber(snap.maxPain) ? snap.maxPain : null,
        callWall: isFiniteNumber(snap.callWall) ? snap.callWall : null,
        putWall: isFiniteNumber(snap.putWall) ? snap.putWall : null
      }
    };

    return {
      gammaState: gammaState,
      oviState: oviState,
      expirationState: expirationState,
      playbook: playbook,
      params: {
        spotPath: spotPath,
        timeToExpiry: dte,
        dealerSign: params["dealer-sign"],
        oviThreshold: oviThreshold,
        aggressiveness: aggr,
        horizon: horizon
      }
    };
  }

  function buildGammaEvidence(api, ownerState) {
    var snap = ownerState.snap || {};
    var state = isFiniteNumber(snap.netGEX) || isFiniteNumber(snap.spot) ? "ready" : "unavailable";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "gamma-trading-lab",
      state: state,
      evidenceCutoff: ownerState.asOf,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:gamma-trading-lab:snapshot:" + ownerState.asOf,
        semanticFingerprint: fingerprintOf(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: ownerState.asOf,
        retrievedOrPublishedAt: ownerState.asOf,
        freshness: "cache-current-for-render",
        dataTier: ownerState.source,
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The playbook uses only the frozen owner gamma snapshot and rolling history; it recomputes no chain and executes no trade."
      ],
      limitations: [
        "The dealer-gamma playbook describes a positioning regime and infers no order and no forecast."
      ],
      invalidationConditions: [
        "The owner gamma snapshot changes or a later same-origin snapshot replaces it."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function gammaPlaybookOutput(input, summary) {
    var ready = summary.gammaState.state === "ready";
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: ready ? "ready" : "unavailable",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: ready ? "ready" : "unavailable", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: "Playbook regime and OVI read against the frozen owner gamma snapshot." },
      provenance: { classes: ready ? ["observed-fact", "model-estimate"] : ["unavailable"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: summary.oviState.state === "ready" ? "bounded" : "wide",
        rangeOrBand: summary.playbook.gammaRegime + " gamma, " + summary.playbook.scenario,
        reason: "Regime, OVI percentile, and the OPEX phase use the exact frozen owner snapshot and history."
      },
      assumptions: [
        "The dealer-sign convention is an explicit assumption, not an observed fact."
      ],
      limitations: [
        "The dealer-gamma playbook describes a positioning regime and infers no order and no forecast."
      ],
      invalidationConditions: [
        "The frozen owner gamma snapshot changes or a later same-origin snapshot replaces it."
      ],
      flatRegionProofs: []
    };
  }

  function summaryPathGamma(summary, path) {
    if (path === "summary.playbook") return summary.playbook;
    if (path === "summary.expirationState") return summary.expirationState;
    if (path === "summary.gammaState") return summary.gammaState;
    if (path === "summary.oviState") return summary.oviState;
    return null;
  }

  function createDealerGammaPlaybookAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !ownerState.snap || typeof ownerState.snap !== "object") {
          return { ok: false, error: { reason: "owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildGammaEvidence(api, frozen);
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
        var summary = computeGammaPlaybookSummary(ownerState, paramMap(input));
        return { ok: true, value: gammaPlaybookOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeGammaPlaybookSummary(ownerState, baselineValues);
        var currentSummary = computeGammaPlaybookSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = GAMMA_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, summaryPathGamma(baselineSummary, path)) !== fingerprintOf(api, summaryPathGamma(currentSummary, path));
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
            valueText: summary.playbook.gammaRegime + " gamma",
            numericValue: summary.gammaState.signedNetGEX,
            unit: "net-gex",
            summary: "Dealers are " + summary.playbook.gammaRegime + " gamma; playbook: " + summary.playbook.scenario +
              " (" + summary.playbook.conviction + ", " + summary.playbook.hold + ").",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ options-structure owner primitives (SINGLE SOURCE; consumed by Power + Simple) ═══════════
     nPDF / nCDF / bsm are the ONE source of the pure, self-contained Black-Scholes greeks
     engine (no `state` closure). options-structure-lab.html's Power path delegates to these
     functions (RLOPTIONS.*) and the options-surface Simple adapter calls the same functions —
     one formula, no copy. Byte/semantic identity is pinned by the TP-05-01 options-surface
     owner-parity tests and the scripts/selftest.mjs options.js canary. The page's higher-level
     aggregation (computeAll/computeGammaFlip/maxPain/computeSkew) stays CLOSURE-COUPLED to the
     page `state` and is a separate Power-only view, not an owner primitive — the surface
     aggregation below re-derives over the FROZEN owner chain using these single-source
     primitives, copying no closure-coupled page code and mutating no owner state. */

  function nPDF(x) { return 0.3989422804014327 * Math.exp(-x * x / 2); }
  function nCDF(x) {
    var t = 1 / (1 + 0.2316419 * Math.abs(x)); var d = nPDF(x);
    var p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? 1 - p : p;
  }
  function bsm(S, K, T, r, q, sig, isCall) {
    var out = { delta: NaN, gamma: NaN, vega: NaN, theta: NaN, vanna: NaN, charm: NaN };
    if (!(S > 0 && K > 0 && T > 0 && sig > 0)) return out;
    var sq = sig * Math.sqrt(T);
    var d1 = (Math.log(S / K) + (r - q + sig * sig / 2) * T) / sq, d2 = d1 - sq;
    var eqt = Math.exp(-q * T), ert = Math.exp(-r * T), nd1 = nPDF(d1), Nd1 = nCDF(d1), Nd2 = nCDF(d2);
    out.gamma = eqt * nd1 / (S * sq);
    out.vega = S * eqt * nd1 * Math.sqrt(T) / 100;
    out.vanna = -eqt * nd1 * d2 / sig / 100;
    if (isCall) {
      out.delta = eqt * Nd1;
      out.theta = (-(S * eqt * nd1 * sig) / (2 * Math.sqrt(T)) - r * K * ert * Nd2 + q * S * eqt * Nd1) / 365;
      out.charm = (q * eqt * Nd1 - eqt * nd1 * (2 * (r - q) * T - d2 * sq) / (2 * T * sq)) / 365;
    } else {
      out.delta = eqt * (Nd1 - 1);
      out.theta = (-(S * eqt * nd1 * sig) / (2 * Math.sqrt(T)) + r * K * ert * nCDF(-d2) - q * S * eqt * nCDF(-d1)) / 365;
      out.charm = (-q * eqt * nCDF(-d1) - eqt * nd1 * (2 * (r - q) * T - d2 * sq) / (2 * T * sq)) / 365;
    }
    return out;
  }

  /* ═══════════ options-surface Simple model (owner seam = options-structure-lab.html) ═══════════
     Given the FROZEN same-origin owner chain snapshot the page hands the adapter (spot, div,
     zoom strike window, minOI liquidity floor, and per-expiry calls/puts), recompute the
     option-structure surface under the steerable scenario parameters. Declared output paths:
       expiry                   -> summary.surface       (which expiries build the surface)
       risk-free-rate           -> summary.surface       (explicit rate feeds the greeks)
       time-decay               -> summary.surface        (advances the clock -> lower T -> greeks)
       spot-shock               -> summary.walls          (bounded spot scenario relocates walls)
       open-interest-weighting  -> summary.walls          (raw OI vs gamma-weighted wall pick)
       iv-shock                 -> summary.expectedMove    (bounded IV shock -> front ±1σ move)
       sign-convention          -> summary.gammaFlip       (dealer sign -> signed net-GEX + regime)
     Every value derives from the parity-proven bsm greeks over the frozen chain; nothing is
     fabricated, no owner state is mutated, and no second chain producer is created (SCN-012-016).
     Raw parameters are echoed ONLY under summary.params — never inside a declared output path. */

  var SURFACE_OUTPUT_PATHS = {
    "expiry": ["summary.surface"],
    "risk-free-rate": ["summary.surface"],
    "time-decay": ["summary.surface"],
    "spot-shock": ["summary.walls"],
    "open-interest-weighting": ["summary.walls"],
    "iv-shock": ["summary.expectedMove"],
    "sign-convention": ["summary.gammaFlip"]
  };

  var SURFACE_MIN_T_YEARS = 0.5 / 365; // half-day floor keeps bsm finite for near-0DTE

  /* Time-to-expiry in years for a chain after advancing the scenario clock by timeDecayDays. */
  function surfaceChainT(chain, timeDecayDays) {
    if (!isFiniteNumber(chain.dte)) return null;
    return Math.max(SURFACE_MIN_T_YEARS, (chain.dte - timeDecayDays) / 365);
  }

  /* Chains whose expiry sits within the selected horizon (days). */
  function surfaceHorizonChains(ownerState, expiryDays) {
    return (ownerState.chains || []).filter(function (chain) {
      return isFiniteNumber(chain.dte) && chain.dte <= expiryDays;
    });
  }

  /* ±zoom% strike window around the owner spot (owner-owned; not a Simple parameter). */
  function surfaceStrikeWindow(ownerState) {
    var spot = ownerState.spot;
    var zoom = isFiniteNumber(ownerState.zoom) ? ownerState.zoom : 100;
    return { lo: spot * (1 - zoom / 100), hi: spot * (1 + zoom / 100) };
  }

  /* Aggregate call/put OI, gamma·OI and delta·OI per strike over the in-horizon chains,
     using the parity-proven owner bsm at the (un-shocked) owner spot. */
  function surfaceAggregate(ownerState, params) {
    var spot = ownerState.spot;
    var div = isFiniteNumber(ownerState.div) ? ownerState.div : 0;
    var minOI = isFiniteNumber(ownerState.minOI) ? ownerState.minOI : 0;
    var win = surfaceStrikeWindow(ownerState);
    var r = params["risk-free-rate"] / 100;
    var timeDecay = params["time-decay"];
    var chains = surfaceHorizonChains(ownerState, params["expiry"]);
    var byK = Object.create(null);
    function bump(K) {
      if (!byK[K]) byK[K] = { K: K, callOI: 0, putOI: 0, cG: 0, pG: 0, cD: 0, pD: 0 };
      return byK[K];
    }
    chains.forEach(function (chain) {
      var T = surfaceChainT(chain, timeDecay);
      if (T === null) return;
      function handle(list, isCall) {
        (list || []).forEach(function (c) {
          var K = c.strike;
          if (!isFiniteNumber(K) || K < win.lo || K > win.hi) return;
          var oi = isFiniteNumber(c.openInterest) ? c.openInterest : 0;
          var vol = isFiniteNumber(c.volume) ? c.volume : 0;
          if (oi < minOI && vol < minOI) return;
          var iv = c.impliedVolatility;
          if (!(iv > 0)) return;
          var g = bsm(spot, K, T, r, div, iv, isCall);
          if (!isFiniteNumber(g.gamma) || !isFiniteNumber(g.delta)) return;
          var row = bump(K);
          if (isCall) { row.callOI += oi; row.cG += g.gamma * oi; row.cD += g.delta * oi; }
          else { row.putOI += oi; row.pG += g.gamma * oi; row.pD += g.delta * oi; }
        });
      }
      handle(chain.calls, true);
      handle(chain.puts, false);
    });
    var strikes = Object.keys(byK).map(function (k) { return byK[k]; }).sort(function (a, b) { return a.K - b.K; });
    return { spot: spot, gCoef: 100 * spot * spot * 0.01, chainsUsed: chains.length, strikes: strikes };
  }

  /* summary.surface — the option-greeks structure over the in-horizon chains. Steered by
     expiry (which chains), risk-free-rate (bsm r), and time-decay (T) through real greeks;
     no raw parameter is echoed here (chainsUsed is a derived count, not the expiry value). */
  function buildSurface(ownerState, params) {
    var agg = surfaceAggregate(ownerState, params);
    var gCoef = agg.gCoef, spot = agg.spot;
    var netGammaExposure = 0, netDeltaExposure = 0, atmGamma = 0, atmDiff = Infinity;
    var projected = agg.strikes.map(function (row) {
      var gammaExposure = gCoef * (row.cG - row.pG);
      netGammaExposure += gammaExposure;
      var deltaExposure = (row.cD + row.pD) * 100 * spot;
      netDeltaExposure += deltaExposure;
      var d = Math.abs(row.K - spot);
      if (d < atmDiff) { atmDiff = d; atmGamma = row.cG + row.pG; }
      return {
        strike: row.K,
        callOI: row.callOI,
        putOI: row.putOI,
        callGammaOI: roundTo(row.cG, 8),
        putGammaOI: roundTo(row.pG, 8),
        callDeltaOI: roundTo(row.cD, 8),
        putDeltaOI: roundTo(row.pD, 8),
        gammaExposure: roundTo(gammaExposure, 4)
      };
    });
    return {
      state: agg.chainsUsed > 0 && projected.length > 0 ? "ready" : "unavailable",
      chainsUsed: agg.chainsUsed,
      strikeCount: projected.length,
      strikes: projected,
      netGammaExposure: roundTo(netGammaExposure, 4),
      netDeltaExposure: roundTo(netDeltaExposure, 4),
      atmGamma: roundTo(atmGamma, 8),
      gCoef: roundTo(gCoef, 6)
    };
  }

  /* summary.walls — call/put walls relative to the SHOCKED spot, picked by raw OI or
     gamma-weighted OI. Steered by spot-shock (which strikes are above/below the scenario
     spot, changing the wall strike) and open-interest-weighting (raw vs gamma pick). Raw
     params live under summary.params; the derived wall strikes/weights carry the effect. */
  function buildWalls(ownerState, params) {
    var agg = surfaceAggregate(ownerState, params);
    var spot = ownerState.spot;
    var shockedSpot = spot * (1 + params["spot-shock"] / 100);
    var raw = params["open-interest-weighting"] === "raw";
    var callWall = null, callWeightBest = -Infinity;
    var putWall = null, putWeightBest = -Infinity;
    agg.strikes.forEach(function (row) {
      var callW = raw ? row.callOI : row.cG;
      var putW = raw ? row.putOI : row.pG;
      if (row.K >= shockedSpot && callW > callWeightBest) { callWeightBest = callW; callWall = row.K; }
      if (row.K <= shockedSpot && putW > putWeightBest) { putWeightBest = putW; putWall = row.K; }
    });
    return {
      state: (callWall !== null || putWall !== null) ? "ready" : "unavailable",
      shockedSpot: roundTo(shockedSpot, 4),
      callWall: callWall,
      putWall: putWall,
      callWallWeight: isFinite(callWeightBest) ? roundTo(callWeightBest, 6) : null,
      putWallWeight: isFinite(putWeightBest) ? roundTo(putWeightBest, 6) : null
    };
  }

  /* IV of the contract whose strike is nearest the owner spot in the given chain. */
  function surfaceNearestIV(chain, spot) {
    var best = null, bestDiff = Infinity;
    ["calls", "puts"].forEach(function (side) {
      (chain[side] || []).forEach(function (c) {
        if (!isFiniteNumber(c.strike) || !(c.impliedVolatility > 0)) return;
        var d = Math.abs(c.strike - spot);
        if (d < bestDiff) { bestDiff = d; best = c.impliedVolatility; }
      });
    });
    return best;
  }

  /* summary.expectedMove — front-expiry ±1σ move from the ATM IV shocked by iv-shock.
     Steered by iv-shock (shockedIV = atmIV + shock/100 -> em). The shocked IV and the
     ±1σ range are derived from the owner ATM IV; the raw shock is not echoed here. */
  function buildExpectedMove(ownerState, params) {
    var spot = ownerState.spot;
    var chains = surfaceHorizonChains(ownerState, params["expiry"]).slice().sort(function (a, b) { return a.dte - b.dte; });
    var front = chains[0];
    if (!front) return { state: "unavailable", frontDte: null, atmIV: null, shockedIV: null, em: null, emPct: null, upper: null, lower: null };
    var T = surfaceChainT(front, params["time-decay"]);
    var atmIV = surfaceNearestIV(front, spot);
    if (!isFiniteNumber(atmIV)) return { state: "unavailable", frontDte: front.dte, atmIV: null, shockedIV: null, em: null, emPct: null, upper: null, lower: null };
    var shockedIV = Math.max(0.0001, atmIV + params["iv-shock"] / 100);
    var em = spot * shockedIV * Math.sqrt(T);
    return {
      state: "ready",
      frontDte: front.dte,
      atmIV: roundTo(atmIV, 6),
      shockedIV: roundTo(shockedIV, 6),
      em: roundTo(em, 4),
      emPct: roundTo(em / spot * 100, 4),
      upper: roundTo(spot + em, 4),
      lower: roundTo(spot - em, 4)
    };
  }

  /* Zero-crossing of the net dealer-gamma curve over the strike window — the gamma flip.
     Mirrors the page computeGammaFlip semantics over the FROZEN chain using the parity-proven
     bsm; the crossing is sign-independent (signMul cancels at g=0), so the flip LEVEL does not
     move with sign — the sign convention moves the signed net-GEX and the regime read instead. */
  function computeSurfaceFlipLevel(ownerState, params) {
    var spot = ownerState.spot;
    var div = isFiniteNumber(ownerState.div) ? ownerState.div : 0;
    var r = params["risk-free-rate"] / 100;
    var timeDecay = params["time-decay"];
    var win = surfaceStrikeWindow(ownerState);
    var chains = surfaceHorizonChains(ownerState, params["expiry"]);
    if (!chains.length) return null;
    var N = 90, pts = [];
    for (var i = 0; i <= N; i++) {
      var S = win.lo + (win.hi - win.lo) * i / N;
      if (!(S > 0)) { pts.push({ S: S, g: 0 }); continue; }
      var g = 0;
      chains.forEach(function (chain) {
        var T = surfaceChainT(chain, timeDecay);
        if (T === null) return;
        function add(list, isCall) {
          (list || []).forEach(function (c) {
            var K = c.strike;
            if (!isFiniteNumber(K) || K < win.lo || K > win.hi) return;
            var oi = isFiniteNumber(c.openInterest) ? c.openInterest : 0;
            if (oi <= 0) return;
            var iv = c.impliedVolatility;
            if (!(iv > 0)) return;
            var b = bsm(S, K, T, r, div, iv, isCall);
            if (!isFiniteNumber(b.gamma)) return;
            g += (isCall ? 1 : -1) * b.gamma * oi;
          });
        }
        add(chain.calls, true);
        add(chain.puts, false);
      });
      pts.push({ S: S, g: 100 * S * S * 0.01 * g });
    }
    var flip = null, bestd = Infinity;
    for (var j = 1; j < pts.length; j++) {
      var a = pts[j - 1], b = pts[j];
      if ((a.g <= 0 && b.g >= 0) || (a.g >= 0 && b.g <= 0)) {
        var t = (0 - a.g) / ((b.g - a.g) || 1);
        var cross = a.S + t * (b.S - a.S);
        var d = Math.abs(cross - spot);
        if (d < bestd) { bestd = d; flip = cross; }
      }
    }
    return flip;
  }

  /* summary.gammaFlip — the signed net-GEX and pinning/trending regime under the declared
     dealer-sign convention. Steered by sign-convention (signMul flips the signed net-GEX
     and, when no flip level is present, the regime). The flip level itself is sign-invariant. */
  function buildGammaFlip(ownerState, params, surface) {
    var signMul = params["sign-convention"] === "customer-short" ? -1 : 1;
    var netGammaBase = surface.netGammaExposure;
    var signedNetGEX = isFiniteNumber(netGammaBase) ? netGammaBase * signMul : null;
    var flipLevel = computeSurfaceFlipLevel(ownerState, params);
    var spot = ownerState.spot;
    var regime;
    if (isFiniteNumber(flipLevel)) regime = spot >= flipLevel ? "positive" : "negative";
    else if (isFiniteNumber(signedNetGEX)) regime = signedNetGEX >= 0 ? "positive" : "negative";
    else regime = "unknown";
    return {
      state: regime === "unknown" ? "unavailable" : "ready",
      flipLevel: isFiniteNumber(flipLevel) ? roundTo(flipLevel, 4) : null,
      signedNetGEX: isFiniteNumber(signedNetGEX) ? roundTo(signedNetGEX, 4) : null,
      regime: regime
    };
  }

  function computeSurfaceSummary(ownerState, params) {
    var surface = buildSurface(ownerState, params);
    var walls = buildWalls(ownerState, params);
    var expectedMove = buildExpectedMove(ownerState, params);
    var gammaFlip = buildGammaFlip(ownerState, params, surface);
    return {
      surface: surface,
      walls: walls,
      expectedMove: expectedMove,
      gammaFlip: gammaFlip,
      params: {
        expiry: params["expiry"],
        spotShockPct: params["spot-shock"],
        ivShockVolPts: params["iv-shock"],
        signConvention: params["sign-convention"],
        openInterestWeighting: params["open-interest-weighting"],
        riskFreeRatePct: params["risk-free-rate"],
        timeDecayDays: params["time-decay"]
      }
    };
  }

  function summaryPathSurface(summary, path) {
    if (path === "summary.surface") return summary.surface;
    if (path === "summary.walls") return summary.walls;
    if (path === "summary.expectedMove") return summary.expectedMove;
    if (path === "summary.gammaFlip") return summary.gammaFlip;
    return null;
  }

  /* Count the option contracts carrying a usable owner row so evidence state is honest:
     ready only when the frozen owner chains carry priced contracts. */
  function surfaceContractCount(ownerState) {
    var count = 0;
    (ownerState.chains || []).forEach(function (chain) {
      ["calls", "puts"].forEach(function (side) {
        (chain[side] || []).forEach(function (c) {
          if (isFiniteNumber(c.strike) && isFiniteNumber(c.openInterest)) count += 1;
        });
      });
    });
    return count;
  }

  function buildSurfaceEvidence(api, ownerState) {
    var count = surfaceContractCount(ownerState);
    var state = count > 0 ? "ready" : "unavailable";
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "options-structure-lab",
      state: state,
      evidenceCutoff: ownerState.asOf,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:options-structure-lab:chain:" + ownerState.asOf,
        semanticFingerprint: fingerprintOf(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: ownerState.asOf,
        retrievedOrPublishedAt: ownerState.asOf,
        freshness: "cache-current-for-render",
        dataTier: ownerState.source,
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The surface uses only the same-origin option contracts present in the frozen owner snapshot."
      ],
      limitations: [
        "Walls, flip, and expected move are option-implied magnets and infer no trade or forecast."
      ],
      invalidationConditions: [
        "The owner options snapshot changes, gains or loses contracts, or a later same-origin snapshot replaces it."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function surfaceOutput(input, summary) {
    var ready = summary.surface.state === "ready";
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: ready ? "ready" : "unavailable",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: ready ? "ready" : "unavailable", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: "Walls, flip, and expected move read against the frozen owner option chain." },
      provenance: { classes: ready ? ["observed-fact", "model-estimate"] : ["unavailable"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: summary.surface.chainsUsed >= 2 ? "bounded" : "wide",
        rangeOrBand: summary.gammaFlip.regime + " gamma; walls " +
          (summary.walls.putWall === null ? "-" : summary.walls.putWall) + " / " +
          (summary.walls.callWall === null ? "-" : summary.walls.callWall),
        reason: "The surface, walls, flip, and expected move use the exact frozen owner chain currently captured."
      },
      assumptions: [
        "The dealer-sign convention is an explicit assumption, not an observed fact."
      ],
      limitations: [
        "Walls, flip, and expected move are option-implied magnets and infer no trade or forecast."
      ],
      invalidationConditions: [
        "The frozen owner options snapshot changes or a later same-origin snapshot replaces it."
      ],
      flatRegionProofs: []
    };
  }

  function createOptionsSurfaceAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !Array.isArray(ownerState.chains)) {
          return { ok: false, error: { reason: "owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildSurfaceEvidence(api, frozen);
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
        var summary = computeSurfaceSummary(ownerState, paramMap(input));
        return { ok: true, value: surfaceOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeSurfaceSummary(ownerState, baselineValues);
        var currentSummary = computeSurfaceSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = SURFACE_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, summaryPathSurface(baselineSummary, path)) !== fingerprintOf(api, summaryPathSurface(currentSummary, path));
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
            valueText: summary.gammaFlip.regime + " gamma",
            numericValue: summary.gammaFlip.signedNetGEX,
            unit: "net-gex",
            summary: "Dealers are " + summary.gammaFlip.regime + " gamma; call wall " +
              (summary.walls.callWall === null ? "-" : summary.walls.callWall) + ", put wall " +
              (summary.walls.putWall === null ? "-" : summary.walls.putWall) + ", front expected move \u00b1" +
              (summary.expectedMove.em === null ? "-" : summary.expectedMove.em) + ".",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* Factory: returns the options Simple adapters implemented at genuine owner-parity,
     keyed by their exact declared adapter ID. Tools whose owner seam is not yet
     extracted are intentionally absent so the shared runtime renders the explicit
     unavailable state for them. */
  function createOptionsAdapters(api, definitions, deps) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLOPTIONS_REQUIRES_RLEXPERIENCE_API");
    }
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (byToolId["options-flow-feed-lab"]) {
      var anomalyDefinition = byToolId["options-flow-feed-lab"];
      adapters[anomalyDefinition.adapterId] = createOptionsAnomalyAdapter(api, anomalyDefinition, ownerByIdentity);
    }
    if (byToolId["gamma-trading-lab"]) {
      var gammaDefinition = byToolId["gamma-trading-lab"];
      adapters[gammaDefinition.adapterId] = createDealerGammaPlaybookAdapter(api, gammaDefinition, ownerByIdentity);
    }
    if (byToolId["options-structure-lab"]) {
      var surfaceDefinition = byToolId["options-structure-lab"];
      adapters[surfaceDefinition.adapterId] = createOptionsSurfaceAdapter(api, surfaceDefinition, ownerByIdentity);
    }
    return adapters;
  }

  /* Register every implemented options adapter with a live shared runtime. Returns
     the per-adapter registration result so the caller can surface honest failures. */
  function registerOptionsAdapters(runtime, api, definitions, deps) {
    var adapters = createOptionsAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "options-adapters/v1",
    module: "rlexperience-adapters/options.js",
    supportedAdapterIds: ["simple-adapter/options-anomaly/v1", "simple-adapter/dealer-gamma-playbook/v1", "simple-adapter/options-surface/v1"],
    volOI: volOI,
    premiumNotional: premiumNotional,
    dteFrom: dteFrom,
    unusualScore: unusualScore,
    parseYahooChain: parseYahooChain,
    scoreChain: scoreChain,
    tapeRead: tapeRead,
    computeAnomalySummary: computeAnomalySummary,
    percentileOf: percentileOf,
    oviPercentile: oviPercentile,
    thirdFriday: thirdFriday,
    nextMonthly: nextMonthly,
    nextQuarterly: nextQuarterly,
    opexInfo: opexInfo,
    gammaEnv: gammaEnv,
    computeGammaPlaybookSummary: computeGammaPlaybookSummary,
    nPDF: nPDF,
    nCDF: nCDF,
    bsm: bsm,
    surfaceChainT: surfaceChainT,
    surfaceHorizonChains: surfaceHorizonChains,
    computeSurfaceSummary: computeSurfaceSummary,
    computeSurfaceFlipLevel: computeSurfaceFlipLevel,
    createOptionsAdapters: createOptionsAdapters,
    registerOptionsAdapters: registerOptionsAdapters
  };
});
