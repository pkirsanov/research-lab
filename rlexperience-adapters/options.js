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

  /* ═══════════ options-flow owner primitives (single source; consumed by Power + Simple) ═══════════
     Extracted VERBATIM from options-flow-feed-lab.html so the Simple adapter and
     the page's Power path share ONE formula. Byte/semantic parity is pinned by the
     TP-05-01 owner-parity test and the scripts/selftest.mjs options.js canary. */

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

  /* ═══════════ options-gamma owner primitives (single source; consumed by Power + Simple) ═══════════
     Extracted VERBATIM from gamma-trading-lab.html so the Simple adapter and the page's
     Power path share ONE formula. gammaEnv is the pure, sign-parameterized form of the
     page's envOf (which reads the page dealer-flip toggle); byte/semantic parity is pinned
     by the TP-05-01 gamma owner-parity test which compares it to the page envOf under both
     dealer-sign conventions. */

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
    supportedAdapterIds: ["simple-adapter/options-anomaly/v1", "simple-adapter/dealer-gamma-playbook/v1"],
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
    createOptionsAdapters: createOptionsAdapters,
    registerOptionsAdapters: registerOptionsAdapters
  };
});
