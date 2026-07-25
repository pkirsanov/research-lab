/*
 * rlexperience-adapters/fundamental-models.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 06 — Fundamental Simple adapters.
 *
 * This module is the SINGLE OWNER SOURCE for the fundamental Simple-model
 * distribution/risk primitives. The owning tool pages consume the exact same
 * exported pure owner functions in their Power path (see ai-capex-strategy-lab.html),
 * and the registered Simple adapters call the same functions — so Simple and
 * Power share one formula and no formula is copied inline (owner-parity).
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
 * global RLFUNDAMENTALS for the owning pages.
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLFUNDAMENTALS_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLFUNDAMENTALS = api;
})(function () {
  "use strict";

  /* ═══════════ pure owner primitives (single source; consumed by Power + Simple) ═══════════
     These are the lognormal simple-return distribution + tail-risk kernel used by the AI-Capex
     Power page. The page's Power path DELEGATES erf/normCdf/invNorm/bandStats/cvarOf to these
     functions (RLFUNDAMENTALS.*) and carries no inline copy — so the distribution/risk formula
     lives in exactly one place and Simple and Power stay byte-identical. `clamp` is a private
     module helper (the page keeps its own trivial inline clamp used across ~15 unrelated sites). */

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* erf: Abramowitz & Stegun 7.1.26 rational approximation of the error function. */
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }

  /* normCdf: standard normal cumulative distribution via erf. */
  function normCdf(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }

  /* invNorm: Acklam's rational approximation of the inverse standard-normal CDF. */
  function invNorm(p) {
    if (p <= 0) return -38; if (p >= 1) return 38;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var pl = 0.02425, ph = 1 - pl, q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p <= ph) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  /* bandStats: lognormal simple-return model fitted to (mu,sd): loss bounded at -100%, fat upside.
     Returns { lo (5th pct), hi (95th pct), prob (chance of clearing target), med (median) }. This is
     the single-source owner distribution formula both the AI-Capex page and the Simple adapter use. */
  function bandStats(mu, sd, target) {
    var base = Math.max(1 + mu, 0.02);
    var s2 = Math.max(Math.log(1 + (sd * sd) / (base * base)), 1e-9);
    var s = Math.sqrt(s2), m = Math.log(base) - s2 / 2;
    function q(pp) { return Math.exp(m + s * invNorm(pp)) - 1; }
    var tgt = (target == null ? 0 : target);
    var prob = tgt <= -0.999 ? 1 : 1 - normCdf((Math.log(1 + tgt) - m) / s);
    return { lo: Math.max(-1, q(0.05)), hi: q(0.95), prob: clamp(prob, 0, 1), med: Math.exp(m) - 1 };
  }

  /* cvarOf: lognormal expected shortfall (CVaR): mean simple-return in the worst `alpha` tail — a
     tail-risk measure variance ignores (negative = loss). Single-source owner risk formula. */
  function cvarOf(mu, sd, alpha) {
    var base = Math.max(1 + mu, 0.02), s2 = Math.max(Math.log(1 + (sd * sd) / (base * base)), 1e-9), s = Math.sqrt(s2), m = Math.log(base) - s2 / 2;
    alpha = alpha || 0.05; var steps = 20, sum = 0; for (var i = 1; i <= steps; i++) { var pp = alpha * (i - 0.5) / steps; sum += Math.exp(m + s * invNorm(pp)) - 1; } return Math.max(-1, sum / steps);
  }

  /* ═══════════ ai-capex-portfolio Simple model (owner seam = ai-capex-strategy-lab.html) ═══════════
     The adapter is a distinct Simple projection: it recomputes a beneficiary/theme distribution, a
     bounded portfolio (μ, σ, effective-N) under an objective + a correlation ceiling, and the
     portfolio return distribution band + CVaR — all from a FROZEN owner snapshot of per-asset
     per-horizon (er, sd) facts. The distribution/risk band is single-sourced from bandStats/cvarOf
     above; the beneficiary/objective/correlation projection is adapter normalization, not a copied
     owner formula. Nothing is fetched, mutated, or defaulted. */

  function isFiniteNumber(value) { return typeof value === "number" && isFinite(value); }

  function roundTo(value, digits) {
    if (!isFiniteNumber(value)) return null;
    var factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  /* tierMultiplier: a small owner tier tilt (higher-tier names rank a little higher) applied to the
     beneficiary base weight. Adapter projection constant, not a copied owner formula. */
  function tierMultiplier(tier) {
    if (tier === "S") return 1.15;
    if (tier === "A") return 1.05;
    return 1.0;
  }

  /* horizonTarget: the return target used for the distribution's clear-the-target probability at a
     horizon (mirrors the AI-Capex owner horizon targets 3/6/10/15%). */
  function horizonTarget(horizon) {
    var map = { "1m": 0.03, "3m": 0.06, "6m": 0.10, "1y": 0.15 };
    return Object.prototype.hasOwnProperty.call(map, horizon) ? map[horizon] : 0.10;
  }

  /* objectiveWeights: the portfolio objective projection over the priced universe.
       return        → w ∝ max(0, er)                     (chase expected return)
       risk-adjusted → w ∝ max(0, er − λσ), λ = 0.3       (owner util μ − λσ, Simple projection λ)
       barbell       → w ∝ max(0, er) · (1 + σ)           (convex: reward upside-vol tails)
     A degenerate objective (all raw weights ≤ 0) falls back to equal weight over the priced set —
     an honest flat allocation, never a fabricated signal. Returns a normalized weight per priced
     view, index-aligned. */
  function objectiveWeights(priced, objective) {
    var lambda = 0.3;
    var raw = priced.map(function (v) {
      if (objective === "return") return Math.max(0, v.er);
      if (objective === "barbell") return Math.max(0, v.er) * (1 + v.sd);
      return Math.max(0, v.er - lambda * v.sd);
    });
    var total = raw.reduce(function (s, x) { return s + x; }, 0);
    if (!(total > 0)) {
      var eq = priced.length ? 1 / priced.length : 0;
      return priced.map(function () { return eq; });
    }
    return raw.map(function (x) { return x / total; });
  }

  /* portfolioMuSd: portfolio mean/σ/effective-N under a pairwise correlation model. Same-theme pairs
     use the owner intra-theme correlation, cross-theme pairs the inter-theme correlation, each capped
     at the caller's correlation ceiling (the diagonal stays 1). Effective-N is inverse-HHI. */
  function portfolioMuSd(priced, weights, corr, ceiling) {
    var mu = 0, i, j;
    for (i = 0; i < priced.length; i++) mu += weights[i] * priced[i].er;
    var intra = isFiniteNumber(corr && corr.intra) ? corr.intra : 0;
    var inter = isFiniteNumber(corr && corr.inter) ? corr.inter : 0;
    var cap = isFiniteNumber(ceiling) ? ceiling : 1;
    var varSum = 0;
    for (i = 0; i < priced.length; i++) {
      for (j = 0; j < priced.length; j++) {
        var c = (i === j) ? 1 : Math.min(priced[i].theme === priced[j].theme ? intra : inter, cap);
        varSum += weights[i] * weights[j] * priced[i].sd * priced[j].sd * c;
      }
    }
    var sd = Math.sqrt(Math.max(varSum, 1e-12));
    var hhi = 0; for (i = 0; i < priced.length; i++) hhi += weights[i] * weights[i];
    return { mu: mu, sd: sd, effN: hhi > 0 ? 1 / hhi : 0 };
  }

  /* seededBandSample: a single seeded lognormal simple-return draw for the frozen (muAdj, sdAdj).
     The seed maps deterministically to a percentile in (0.05, 0.95) and the sample is q(percentile)
     of the same lognormal fit — a reproducible "distribution path" (a different seed = a different
     percentile draw), single-sourcing invNorm. */
  function seededPercentile(seed) {
    var x = Math.abs(Math.sin(((Number(seed) || 0)) * 12.9898) * 43758.5453);
    var frac = x - Math.floor(x);
    return 0.05 + 0.90 * frac;
  }
  function seededBandSample(muAdj, sdAdj, seed) {
    var base = Math.max(1 + muAdj, 0.02);
    var s2 = Math.max(Math.log(1 + (sdAdj * sdAdj) / (base * base)), 1e-9);
    var s = Math.sqrt(s2), m = Math.log(base) - s2 / 2;
    return Math.exp(m + s * invNorm(seededPercentile(seed))) - 1;
  }

  /* Frozen per-asset view at the selected horizon (null er/sd => unpriced, never a fabricated fill). */
  function aiCapexViews(ownerState, horizon) {
    var assets = (ownerState && Array.isArray(ownerState.assets)) ? ownerState.assets : [];
    return assets.map(function (a) {
      var h = a.byHorizon && a.byHorizon[horizon];
      var priced = h && isFiniteNumber(h.er) && isFiniteNumber(h.sd);
      return {
        id: String(a.id),
        ticker: String(a.ticker || a.id),
        theme: String(a.theme || "Unclassified"),
        tier: String(a.tier || ""),
        crowding: isFiniteNumber(a.crowding) ? a.crowding : 0,
        er: priced ? h.er : null,
        sd: priced ? h.sd : null,
        priced: !!priced
      };
    });
  }

  /* Compute the frozen portfolio μ/σ + crowding/risk-adjusted (muAdj, sdAdj) and the distribution
     target from owner state + current parameters. Exposed so the owner-parity test can re-run the
     single-source band/CVaR directly on the same (muAdj, sdAdj, target). */
  function computeAiCapexPortfolio(ownerState, params) {
    var horizon = params.horizon;
    var objective = params.objective;
    var correlationCeiling = params["correlation-ceiling"];
    var crowdingPenalty = params["crowding-penalty"];
    var riskDamper = params["risk-damper"];
    var corr = (ownerState && ownerState.correlation) || { intra: 0, inter: 0 };

    var views = aiCapexViews(ownerState, horizon);
    var priced = views.filter(function (v) { return v.priced; });
    var weights = objectiveWeights(priced, objective);
    var ms = portfolioMuSd(priced, weights, corr, correlationCeiling);

    var crowdingDrag = 0;
    for (var i = 0; i < priced.length; i++) crowdingDrag += weights[i] * priced[i].crowding;

    var muAdj = ms.mu - crowdingPenalty * crowdingDrag;
    var sdAdj = ms.sd * (1 - 0.5 * riskDamper);
    return {
      views: views,
      priced: priced,
      weights: weights,
      mu: ms.mu,
      sd: ms.sd,
      effN: ms.effN,
      crowdingDrag: crowdingDrag,
      muAdj: muAdj,
      sdAdj: sdAdj,
      target: horizonTarget(horizon)
    };
  }

  /* Compute the full ai-capex-portfolio summary from frozen owner state + current parameters. Every
     value derives from the frozen owner facts through the single-source band/CVaR primitives and the
     adapter's own beneficiary/objective/correlation projection; nothing is fabricated or defaulted. */
  function computeAiCapexSummary(ownerState, params) {
    var horizon = params.horizon;
    var themeWeight = params["theme-weight"];
    var crowdingPenalty = params["crowding-penalty"];
    var riskDamper = params["risk-damper"];
    var correlationCeiling = params["correlation-ceiling"];
    var objective = params.objective;
    var seed = params.seed;
    var selectedTheme = ownerState && ownerState.selectedTheme ? String(ownerState.selectedTheme) : null;

    var port = computeAiCapexPortfolio(ownerState, params);
    var priced = port.priced;

    // ── beneficiaries (theme distribution) — theme-weight scales the selected owner theme up ──
    var themeTotals = Object.create(null);
    var totalBenef = 0;
    priced.forEach(function (v) {
      var rawWeight = Math.max(0, v.er) * tierMultiplier(v.tier);
      var scaled = (selectedTheme && v.theme === selectedTheme) ? rawWeight * (0.5 + themeWeight) : rawWeight;
      themeTotals[v.theme] = (themeTotals[v.theme] || 0) + scaled;
      totalBenef += scaled;
    });
    var beneficiaries = Object.keys(themeTotals).map(function (theme) {
      return { theme: theme, weight: totalBenef > 0 ? roundTo(themeTotals[theme] / totalBenef, 6) : 0 };
    }).sort(function (a, b) {
      var d = (b.weight == null ? -Infinity : b.weight) - (a.weight == null ? -Infinity : a.weight);
      if (d !== 0) return d;
      return a.theme < b.theme ? -1 : (a.theme > b.theme ? 1 : 0);
    });

    // ── portfolio (objective + correlation ceiling) ──
    var holdings = priced.map(function (v, index) {
      return { ticker: v.ticker, theme: v.theme, weight: roundTo(port.weights[index], 6) };
    }).sort(function (a, b) {
      var d = (b.weight == null ? -Infinity : b.weight) - (a.weight == null ? -Infinity : a.weight);
      if (d !== 0) return d;
      return a.ticker < b.ticker ? -1 : (a.ticker > b.ticker ? 1 : 0);
    });
    var portfolio = {
      objective: String(objective),
      mu: roundTo(port.mu, 6),
      sd: roundTo(port.sd, 6),
      effN: roundTo(port.effN, 6),
      holdings: holdings
    };

    // ── distribution (single-sourced lognormal band + CVaR under crowding/risk-damper/seed) ──
    var band = bandStats(port.muAdj, port.sdAdj, port.target);
    var distribution = {
      median: roundTo(band.med, 6),
      lo: roundTo(band.lo, 6),
      hi: roundTo(band.hi, 6),
      prob: roundTo(band.prob, 6),
      cvar: roundTo(cvarOf(port.muAdj, port.sdAdj, 0.05), 6),
      seedSample: roundTo(seededBandSample(port.muAdj, port.sdAdj, seed), 6)
    };

    return {
      horizon: String(horizon),
      themeWeight: themeWeight,
      crowdingPenalty: crowdingPenalty,
      riskDamper: riskDamper,
      correlationCeiling: correlationCeiling,
      objective: String(objective),
      selectedTheme: selectedTheme,
      assetCount: port.views.length,
      pricedCount: priced.length,
      beneficiaries: beneficiaries,
      portfolio: portfolio,
      distribution: distribution
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

  function aiCapexEvidenceState(ownerState) {
    var assets = (ownerState && Array.isArray(ownerState.assets)) ? ownerState.assets : [];
    var priced = 0;
    assets.forEach(function (asset) {
      var byHorizon = asset && asset.byHorizon;
      var anyHorizon = byHorizon && Object.keys(byHorizon).some(function (key) {
        var h = byHorizon[key];
        return h && isFiniteNumber(h.er) && isFiniteNumber(h.sd);
      });
      if (anyHorizon) priced++;
    });
    return priced > 0 ? "ready" : "unavailable";
  }

  function buildAiCapexEvidence(api, ownerState) {
    var state = aiCapexEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "ai-capex-strategy-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:ai-capex-strategy-lab:portfolio:" + cutoff,
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
        "The portfolio uses only the frozen owner per-asset per-horizon expected-return and volatility facts currently captured."
      ],
      limitations: [
        "The distribution describes the selected owner window under the chosen objective and does not establish an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes, gains or loses an asset, or a later owner run replaces the current per-horizon facts."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function aiCapexOutput(input, summary) {
    var provenanceClasses = summary.pricedCount < summary.assetCount
      ? ["observed-fact", "model-estimate"]
      : ["observed-fact"];
    var calibrationReason = summary.pricedCount + " of " + summary.assetCount +
      " assets carry a complete owner per-horizon expected-return/volatility fact.";
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
        rangeOrBand: "Median " + (summary.distribution.median == null ? "—" : summary.distribution.median) +
          " / CVaR " + (summary.distribution.cvar == null ? "—" : summary.distribution.cvar),
        reason: "Beneficiary distribution, portfolio, and the return band/CVaR use the exact frozen owner per-horizon facts currently captured."
      },
      assumptions: [
        "Assets without a complete per-horizon fact at the selected horizon are excluded from the priced portfolio."
      ],
      limitations: [
        "The distribution describes the selected owner window under the chosen objective and does not establish an allocation."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later owner run replaces the current per-horizon facts."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the ai-capex-portfolio parameters. Mirrors simple-models.json exactly. */
  var AI_CAPEX_OUTPUT_PATHS = {
    "horizon": ["summary.distribution"],
    "theme-weight": ["summary.beneficiaries"],
    "crowding-penalty": ["summary.distribution"],
    "risk-damper": ["summary.distribution"],
    "correlation-ceiling": ["summary.portfolio"],
    "objective": ["summary.portfolio"]
  };

  function aiCapexSummaryPath(summary, path) {
    if (path === "summary.distribution") return summary.distribution;
    if (path === "summary.beneficiaries") return summary.beneficiaries;
    if (path === "summary.portfolio") return summary.portfolio;
    return null;
  }

  function createAiCapexPortfolioAdapter(api, definition, ownerByIdentity) {
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
          return { ok: false, error: { reason: "ai-capex portfolio owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildAiCapexEvidence(api, frozen);
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
        var summary = computeAiCapexSummary(ownerState, paramMap(input));
        return { ok: true, value: aiCapexOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeAiCapexSummary(ownerState, baselineValues);
        var currentSummary = computeAiCapexSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = AI_CAPEX_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, aiCapexSummaryPath(baselineSummary, path)) !== fingerprintOf(api, aiCapexSummaryPath(currentSummary, path));
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
        var lead = summary.beneficiaries.length ? summary.beneficiaries[0] : null;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.distribution.median == null ? "No priced portfolio" : ("Median return " + summary.distribution.median),
            numericValue: summary.distribution.median,
            unit: "simple-return",
            summary: lead
              ? (lead.theme + " leads the beneficiary distribution; median return " +
                (summary.distribution.median == null ? "—" : summary.distribution.median) +
                " under the " + summary.objective + " objective at " + summary.horizon + ".")
              : "No asset prices at the selected owner horizon.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ company-scenario-bridge Simple model (owner seam = company-fundamentals-lab.html) ═══════════
     The source-qualified company scenario lineage: a bounded scenario projected from the FROZEN reported
     base (revenue, operating margin, revenue growth, capital intensity, valuation multiple) under an
     explicit growth/margin overlay, an accepted-state anchor (reported evidence vs the linked scenario
     revision), an evidence-gap policy, and a lineage cutoff. The bounded projection PRESERVES source
     gaps: a reported field that is unavailable stays null (honest unavailable/partial), never a
     fabricated default; under the `refuse` gap policy an unresolved required reported gap withholds the
     whole scenario. `projectCompanyScenario` is the SINGLE SOURCE that the company page Power path and
     the registered Simple adapter both consume. Power retains the full owner model, identity, filings,
     statement coverage, source clocks, peers, gaps, and history; Simple asks only the bounded question. */

  /* companyReportedField: normalize a frozen reported fact (value|null + availability) — gap-preserving.
     A non-finite / absent value stays null with state "unavailable"; a gap is never a fabricated 0. */
  function companyReportedField(field) {
    if (!field || typeof field !== "object") return { value: null, unit: null, state: "unavailable" };
    var v = isFiniteNumber(field.value) ? field.value : null;
    return { value: v, unit: field.unit == null ? null : String(field.unit), state: v === null ? "unavailable" : String(field.state || "reported") };
  }

  /* companyReportedBase: marshal the frozen reported base, preserving each field's gap. Idempotent —
     the owning page marshals the same shape from its accepted-publication lineage and hands the
     identical base to projectCompanyScenario, so Power and Simple share exactly one projection input. */
  function companyReportedBase(reported) {
    reported = reported || {};
    return {
      revenue: companyReportedField(reported.revenue),
      operatingMargin: companyReportedField(reported.operatingMargin),
      revenueGrowth: companyReportedField(reported.revenueGrowth),
      capexIntensity: companyReportedField(reported.capexIntensity),
      valuationMultiple: companyReportedField(reported.valuationMultiple)
    };
  }

  /* projectCompanyScenario: the SINGLE-SOURCE bounded company scenario formula. Applies an explicit
     growth (percent) and margin change (percentage points) to the frozen reported base and derives
     operating income, capital expenditure, and a bounded valuation. Every derived field that depends on
     a gapped reported field stays null (honest unavailable/partial) — never a fabricated default. Under
     the `refuse` gap policy an unresolved required reported gap (revenue or operating margin) withholds
     the whole scenario (state "refused", all numbers null). Pure compute; no fetch, mutation, or default. */
  function projectCompanyScenario(base, params) {
    var b = companyReportedBase(base);
    var growth = isFiniteNumber(params && params.growth) ? params.growth : 0;
    var marginChange = isFiniteNumber(params && params.marginChange) ? params.marginChange : 0;
    var gapPolicy = (params && params.gapPolicy === "refuse") ? "refuse" : "preserve";

    var rev0 = b.revenue.value, m0 = b.operatingMargin.value, capI = b.capexIntensity.value, mult = b.valuationMultiple.value;
    var missing = [];
    if (rev0 === null) missing.push("revenue");
    if (m0 === null) missing.push("operatingMargin");
    if (capI === null) missing.push("capexIntensity");
    if (mult === null) missing.push("valuationMultiple");
    var requiredMissing = (rev0 === null) || (m0 === null);

    if (gapPolicy === "refuse" && requiredMissing) {
      return {
        revenue: null, operatingMargin: null, operatingIncome: null, capex: null, valuation: null,
        state: "refused", missing: missing,
        reason: "The evidence-gap policy refuses an incomplete scenario: a required reported field (" + missing.join(", ") + ") is unavailable."
      };
    }

    var g = growth / 100, dm = marginChange / 100;
    var revenue = rev0 === null ? null : roundTo(rev0 * (1 + g), 6);
    var margin = m0 === null ? null : roundTo(clamp(m0 + dm, -1, 1), 6);
    var operatingIncome = (revenue === null || margin === null) ? null : roundTo(revenue * margin, 6);
    var capex = (revenue === null || capI === null) ? null : roundTo(revenue * capI, 6);
    var valuation = (operatingIncome === null || mult === null) ? null : roundTo(operatingIncome * mult, 6);
    var state = missing.length === 0 ? "ready" : (requiredMissing ? "unavailable" : "partial");
    return {
      revenue: revenue, operatingMargin: margin, operatingIncome: operatingIncome, capex: capex, valuation: valuation,
      state: state, missing: missing,
      reason: state === "ready"
        ? "All reported fields are available; the bounded scenario is complete."
        : (state === "unavailable"
          ? "A required reported field is unavailable, so the bounded scenario is unavailable — no default is substituted."
          : "Some reported fields are unavailable; the bounded scenario is partial and preserves the gaps — no default is substituted.")
    };
  }

  /* companyScenarioLineage: derive the accepted-scenario lineage age (evidence-cutoff asOf minus the
     scenario createdAt, in whole days) and whether it is within the caller's lineage cutoff. Deterministic
     over the FROZEN owner clocks — never Date.now(). Missing clocks stay unavailable, never a default age. */
  function companyScenarioLineage(lineage, asOf, cutoffDays) {
    lineage = lineage || {};
    var createdMs = Date.parse(lineage.createdAt), asOfMs = Date.parse(asOf);
    var ageDays = (isFiniteNumber(createdMs) && isFiniteNumber(asOfMs)) ? Math.max(0, Math.floor((asOfMs - createdMs) / 864e5)) : null;
    var cd = isFiniteNumber(cutoffDays) ? cutoffDays : null;
    var withinCutoff = (ageDays === null || cd === null) ? null : (ageDays <= cd);
    return {
      revision: (lineage.revision === undefined || lineage.revision === null) ? null : lineage.revision,
      owner: lineage.owner == null ? null : String(lineage.owner),
      scenarioRevisionId: lineage.scenarioRevisionId == null ? null : String(lineage.scenarioRevisionId),
      createdAt: lineage.createdAt == null ? null : String(lineage.createdAt),
      ageDays: ageDays,
      cutoffDays: cd,
      withinCutoff: withinCutoff,
      state: withinCutoff === null ? "unavailable" : (withinCutoff ? "within" : "stale")
    };
  }

  /* companyGapLedger: preserve the frozen evidence gaps under the caller's gap policy. `preserve` keeps
     every gap as an honest unavailable entry; `refuse` additionally marks a required unresolved gap as
     blocking and refuses acceptance. Never fabricates evidence for a gap. */
  function companyGapLedger(gaps, gapPolicy) {
    var policy = gapPolicy === "refuse" ? "refuse" : "preserve";
    var entries = (Array.isArray(gaps) ? gaps : []).map(function (gap) {
      var required = !!(gap && gap.required);
      return {
        evidenceClass: gap && gap.evidenceClass != null ? String(gap.evidenceClass) : "unclassified",
        concept: gap && gap.concept != null ? String(gap.concept) : null,
        state: gap && gap.state != null ? String(gap.state) : "unavailable",
        required: required,
        blocking: policy === "refuse" && required
      };
    });
    var refused = policy === "refuse" && entries.some(function (entry) { return entry.blocking; });
    return {
      policy: policy,
      refused: refused,
      count: entries.length,
      requiredGapCount: entries.filter(function (entry) { return entry.required; }).length,
      entries: entries
    };
  }

  /* companyAcceptedAnchor: the accepted-state param selects the source-qualified lineage the scenario is
     LABELED with — reported evidence (observed-fact, statement cutoff) or the linked scenario revision
     (model-estimate, model cutoff). It changes only the accepted-state label + provenance anchor, never
     the projected numbers (which stay grounded in the reported base), so accepted-state moves summary.state
     alone. */
  function companyAcceptedAnchor(lineage, acceptedState) {
    lineage = lineage || {};
    if (acceptedState === "scenario") {
      return {
        accepted: "scenario",
        anchorClass: "model-estimate",
        anchorCutoff: lineage.modelCutoff == null ? null : String(lineage.modelCutoff),
        anchorRevision: lineage.scenarioRevisionId == null ? null : String(lineage.scenarioRevisionId),
        label: "Linked scenario revision accepted as the source-qualified state."
      };
    }
    return {
      accepted: "reported",
      anchorClass: "observed-fact",
      anchorCutoff: lineage.statementCutoff == null ? null : String(lineage.statementCutoff),
      anchorRevision: (lineage.revision === undefined || lineage.revision === null) ? null : lineage.revision,
      label: "Reported evidence accepted as the source-qualified state."
    };
  }

  /* Compute the full company-scenario-bridge summary from FROZEN owner state + current parameters. Every
     value derives from the frozen owner facts through the single-source projection/lineage/gap primitives;
     nothing is fetched, mutated, or defaulted. Each parameter moves exactly its declared summary path:
     accepted-state → summary.state, growth/margin → summary.scenario, gap-policy → summary.gaps,
     lineage-cutoff → summary.lineage. */
  function computeCompanyScenarioSummary(ownerState, params) {
    var acceptedState = params["accepted-state"] === "scenario" ? "scenario" : "reported";
    var gapPolicy = params["evidence-gap-policy"] === "refuse" ? "refuse" : "preserve";
    var base = companyReportedBase(ownerState.reported);
    var scenario = projectCompanyScenario(base, { growth: params["growth-assumption"], marginChange: params["margin-change"], gapPolicy: gapPolicy });
    var lineage = companyScenarioLineage(ownerState.lineage, ownerState.asOf, params["lineage-cutoff"]);
    var gaps = companyGapLedger(ownerState.gaps, gapPolicy);
    var state = companyAcceptedAnchor(ownerState.lineage, acceptedState);
    return {
      companyId: String(ownerState.companyId || ownerState.toolId || "company-fundamentals-lab"),
      asOf: String(ownerState.asOf || "unavailable"),
      acceptedState: acceptedState,
      state: state,
      reported: base,
      scenario: scenario,
      gaps: gaps,
      lineage: lineage
    };
  }

  /* ═══════════ company-scenario-bridge Simple adapter contract wiring ═══════════ */

  function companyReportedCount(ownerState) {
    var base = companyReportedBase(ownerState && ownerState.reported);
    var n = 0;
    ["revenue", "operatingMargin", "revenueGrowth", "capexIntensity", "valuationMultiple"].forEach(function (key) {
      if (base[key].value !== null) n += 1;
    });
    return n;
  }

  function companyEvidenceState(ownerState) {
    var base = companyReportedBase(ownerState && ownerState.reported);
    return (base.revenue.value !== null && base.operatingMargin.value !== null) ? "ready" : "unavailable";
  }

  function buildCompanyEvidence(api, ownerState) {
    var state = companyEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "company-fundamentals-lab",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:company-fundamentals-lab:scenario:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "accepted publication snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The bounded scenario uses only the frozen reported base facts currently captured, plus the explicit growth and margin overlay."
      ],
      limitations: [
        "The bounded scenario preserves every source gap and does not establish a valuation, a recommendation, or a complete company model."
      ],
      invalidationConditions: [
        "The accepted publication changes, a reported base fact gains or loses availability, or a later scenario revision replaces the current lineage."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function companyProvenanceClasses(summary) {
    var classes = ["observed-fact", "user-assumption"];
    if (summary.acceptedState === "scenario") classes.push("model-estimate");
    if (summary.gaps.count > 0 || summary.scenario.state !== "ready") classes.push("unavailable");
    var seen = Object.create(null), ordered = [];
    classes.forEach(function (cls) { if (!seen[cls]) { seen[cls] = true; ordered.push(cls); } });
    return ordered;
  }

  function companyOutput(input, summary) {
    var reportedCount = 0;
    ["revenue", "operatingMargin", "revenueGrowth", "capexIntensity", "valuationMultiple"].forEach(function (key) {
      if (summary.reported[key].value !== null) reportedCount += 1;
    });
    var calibrationReason = reportedCount + " of 5 reported base facts are available; " + summary.gaps.count +
      " source evidence gap(s) are preserved under the " + summary.gaps.policy + " policy.";
    var uncertaintyState = summary.scenario.state === "ready" ? "bounded" : "wide";
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: calibrationReason },
      provenance: { classes: companyProvenanceClasses(summary), evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: uncertaintyState,
        rangeOrBand: "Scenario " + summary.scenario.state + " / gaps " + summary.gaps.count + (summary.gaps.refused ? " (refused)" : ""),
        reason: "The bounded scenario, the accepted-state anchor, the preserved gap ledger, and the lineage age all derive from the exact frozen owner facts currently captured."
      },
      assumptions: [
        "The growth and margin change are explicit user assumptions applied over the frozen reported base."
      ],
      limitations: [
        "A reported field that is unavailable stays unavailable in the scenario; no default is substituted."
      ],
      invalidationConditions: [
        "The accepted publication changes or a later scenario revision replaces the current lineage."
      ],
      flatRegionProofs: []
    };
  }

  /* affectsOutputPaths for the company-scenario-bridge parameters. Mirrors simple-models.json exactly. */
  var COMPANY_OUTPUT_PATHS = {
    "accepted-state": ["summary.state"],
    "growth-assumption": ["summary.scenario"],
    "margin-change": ["summary.scenario"],
    "evidence-gap-policy": ["summary.gaps"],
    "lineage-cutoff": ["summary.lineage"]
  };

  function companySummaryPath(summary, path) {
    if (path === "summary.state") return summary.state;
    if (path === "summary.scenario") return summary.scenario;
    if (path === "summary.gaps") return summary.gaps;
    if (path === "summary.lineage") return summary.lineage;
    return null;
  }

  function createCompanyScenarioBridgeAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !ownerState.reported || typeof ownerState.reported !== "object") {
          return { ok: false, error: { reason: "company scenario owner state (reported base) required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildCompanyEvidence(api, frozen);
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
        var summary = computeCompanyScenarioSummary(ownerState, paramMap(input));
        return { ok: true, value: companyOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeCompanyScenarioSummary(ownerState, baselineValues);
        var currentSummary = computeCompanyScenarioSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = COMPANY_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, companySummaryPath(baselineSummary, path)) !== fingerprintOf(api, companySummaryPath(currentSummary, path));
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
        var revText = summary.scenario.revenue == null ? "unavailable" : String(summary.scenario.revenue);
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: summary.scenario.state === "refused" ? "Scenario refused" : ("Projected revenue " + revText),
            numericValue: summary.scenario.revenue,
            unit: summary.reported.revenue.unit || "reported-unit",
            summary: "Accepted " + summary.state.accepted + " state; bounded scenario " + summary.scenario.state +
              " with projected revenue " + revText + "; " + summary.gaps.count + " source gap(s) preserved" +
              (summary.gaps.refused ? " (refused)" : "") + "; lineage " + summary.lineage.state + ".",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* ═══════════ msft-margin-eps Simple model (owner seam = msft-july-print-model.html) ═══════════
     The reported-period FY26→FY27 margin / EPS / valuation bridge. `msftAnnualBridge` is the SINGLE
     SOURCE that BOTH the MSFT July-print Power page's calculateAnnual AND the registered Simple adapter
     consume: the page reads the DOM into the decimal bridge inputs and delegates the reconciled math
     here (RLFUNDAMENTALS.msftAnnualBridge), carrying no inline copy. Inputs are the already-decimal
     scenario facts (om26/vol/prc/churn/fx/pm/vm/cm/opexI/tax are ratios; revFY26/dDep/oi/sh/pe are
     absolute). Returns the reconciled bridge: FY27 operating income, operating margin, FY26/FY27 EPS,
     and the implied price (EPS27 * pe). Pure compute — no fetch, mutation, DOM, or default. */

  function msftNum(value) { var n = Number(value); return isFinite(n) ? n : 0; }

  function msftAnnualBridge(inputs) {
    var i = inputs || {};
    var revFY26 = i.revFY26, om26 = i.om26;
    var vol = i.vol, prc = i.prc, churn = i.churn, fx = i.fx;
    var pm = i.pm, vm = i.vm, cm = i.cm, opexI = i.opexI;
    var dDep = i.dDep;
    var oi = i.oi, tax = i.tax, sh = i.sh, pe = i.pe;
    var OI26 = revFY26 * om26;
    var dRevPrice = revFY26 * prc, dRevVol = revFY26 * vol, dRevFx = revFY26 * fx, dRevChurn = revFY26 * churn;
    var GP_price = dRevPrice * pm, GP_vol = dRevVol * vm, GP_fx = dRevFx * 0.95, GP_churn = dRevChurn * cm;
    var dOpex = opexI * (dRevPrice + dRevVol);
    var OI27 = OI26 + GP_price + GP_vol + GP_fx - GP_churn - dDep - dOpex;
    var totalGrowthPct = (prc + vol + fx - churn);
    var RevFY27 = revFY26 * (1 + totalGrowthPct);
    var OM27 = RevFY27 > 0 ? OI27 / RevFY27 : 0;
    var NI26 = (OI26 + oi) * (1 - tax), NI27 = (OI27 + oi) * (1 - tax);
    var EPS26 = NI26 / sh, EPS27 = NI27 / sh, implied = EPS27 * pe;
    return {
      revFY26: revFY26, om26: om26, oi: oi, tax: tax, sh: sh, pe: pe, OI26: OI26,
      GP_price: GP_price, GP_vol: GP_vol, GP_fx: GP_fx, GP_churn: GP_churn, dOpex: dOpex, dDep: dDep,
      OI27: OI27, totalGrowthPct: totalGrowthPct, RevFY27: RevFY27, OM27: OM27,
      EPS26: EPS26, EPS27: EPS27, implied: implied
    };
  }

  /* msftPhaseTilt: the cost-cycle capex phase tilts the FY27 incremental depreciation step — an early
     heavy-build phase carries a heavier step, a mature phase a lighter one. Adapter projection tilt,
     not a copied owner formula. */
  function msftPhaseTilt(phase) {
    if (phase === "early") return 1.30;
    if (phase === "mature") return 0.70;
    return 1.0;
  }

  /* computeMsftBridgeInputs: project the seven Simple params over the FROZEN owner bridge facts into the
     scenario bridge inputs the single-source msftAnnualBridge consumes. depreciation-growth grows the
     frozen FY26 D&A base into the FY27 step, tilted by the capex phase; mix-shift adds to the price/mix
     growth; memory-cost-impact erodes the volume margin; fx-impact adds to the FX contribution;
     earnings-anchor selects the frozen consensus vs seasonality FY26 OM anchor; and valuation-multiple
     overrides the forward multiple used by the valuation bridge. Every input is a frozen owner fact or a
     bounded user assumption — nothing is fetched, mutated, or defaulted. */
  function computeMsftBridgeInputs(ownerState, params) {
    var bridge = (ownerState && ownerState.bridge) || {};
    var depGrowth = msftNum(params["depreciation-growth"]) / 100;
    var mixShift = msftNum(params["mix-shift"]) / 100;
    var fxImpact = msftNum(params["fx-impact"]) / 100;
    var memoryCost = msftNum(params["memory-cost-impact"]) / 100;
    var phase = params["capex-phase"];
    var anchor = params["earnings-anchor"];
    var multiple = msftNum(params["valuation-multiple"]);

    var anchors = (ownerState && ownerState.anchors) || {};
    var baseOm = isFiniteNumber(bridge.om26) ? bridge.om26 : 0;
    var anchoredOm = anchor === "seasonality"
      ? (isFiniteNumber(anchors.seasonality) ? anchors.seasonality : baseOm)
      : (isFiniteNumber(anchors.consensus) ? anchors.consensus : baseOm);

    var depBase = isFiniteNumber(ownerState && ownerState.depreciationBase) ? ownerState.depreciationBase : msftNum(bridge.dDep);
    var dDepScenario = depBase * depGrowth * msftPhaseTilt(phase);

    return {
      revFY26: msftNum(bridge.revFY26),
      om26: anchoredOm,
      vol: msftNum(bridge.vol),
      prc: msftNum(bridge.prc) + mixShift,
      churn: msftNum(bridge.churn),
      fx: msftNum(bridge.fx) + fxImpact,
      pm: msftNum(bridge.pm),
      vm: msftNum(bridge.vm) - memoryCost,
      cm: msftNum(bridge.cm),
      opexI: msftNum(bridge.opexI),
      dDep: dDepScenario,
      oi: msftNum(bridge.oi),
      tax: msftNum(bridge.tax),
      sh: msftNum(bridge.sh),
      pe: multiple
    };
  }

  /* affectsOutputPaths for the msft-margin-eps parameters. Mirrors simple-models.json exactly. */
  var MSFT_OUTPUT_PATHS = {
    "depreciation-growth": ["summary.margin"],
    "mix-shift": ["summary.margin"],
    "fx-impact": ["summary.eps"],
    "memory-cost-impact": ["summary.margin"],
    "capex-phase": ["summary.margin"],
    "earnings-anchor": ["summary.eps"],
    "valuation-multiple": ["summary.valuation"]
  };

  function msftSummaryPath(summary, path) {
    if (path === "summary.margin") return summary.margin;
    if (path === "summary.eps") return summary.eps;
    if (path === "summary.valuation") return summary.valuation;
    return null;
  }

  /* Compute the full msft-margin-eps summary from FROZEN owner state + current parameters. Every value
     derives from the frozen owner bridge facts through the single-source msftAnnualBridge; nothing is
     fetched, mutated, or defaulted. Each parameter moves at least its declared summary path:
     depreciation-growth/mix-shift/memory-cost-impact/capex-phase → summary.margin, fx-impact/
     earnings-anchor → summary.eps, valuation-multiple → summary.valuation. */
  function computeMsftMarginEpsSummary(ownerState, params) {
    var inputs = computeMsftBridgeInputs(ownerState, params);
    var bridge = msftAnnualBridge(inputs);
    return {
      toolId: String((ownerState && ownerState.toolId) || "msft-july-print-model"),
      asOf: String((ownerState && ownerState.asOf) || "unavailable"),
      depreciationGrowth: msftNum(params["depreciation-growth"]),
      mixShift: msftNum(params["mix-shift"]),
      fxImpact: msftNum(params["fx-impact"]),
      memoryCostImpact: msftNum(params["memory-cost-impact"]),
      capexPhase: String(params["capex-phase"]),
      earningsAnchor: String(params["earnings-anchor"]),
      valuationMultiple: msftNum(params["valuation-multiple"]),
      margin: {
        om27: roundTo(bridge.OM27, 6),
        oi27: roundTo(bridge.OI27, 6),
        gpPrice: roundTo(bridge.GP_price, 6),
        gpVol: roundTo(bridge.GP_vol, 6),
        incrementalDepreciation: roundTo(bridge.dDep, 6),
        revenueFy27: roundTo(bridge.RevFY27, 6)
      },
      eps: {
        eps26: roundTo(bridge.EPS26, 6),
        eps27: roundTo(bridge.EPS27, 6),
        deltaEps: roundTo(bridge.EPS27 - bridge.EPS26, 6),
        fxContribution: roundTo(bridge.GP_fx, 6),
        anchoredOperatingMargin: roundTo(inputs.om26, 6)
      },
      valuation: {
        multiple: roundTo(bridge.pe, 6),
        impliedPrice: roundTo(bridge.implied, 6),
        eps27: roundTo(bridge.EPS27, 6)
      }
    };
  }

  /* ═══════════ msft-margin-eps Simple adapter contract wiring ═══════════ */

  function msftEvidenceState(ownerState) {
    var bridge = (ownerState && ownerState.bridge) || {};
    return (isFiniteNumber(bridge.revFY26) && isFiniteNumber(bridge.om26) && isFiniteNumber(bridge.sh) && bridge.sh !== 0)
      ? "ready" : "unavailable";
  }

  function buildMsftEvidence(api, ownerState) {
    var state = msftEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: "msft-july-print-model",
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:msft-july-print-model:bridge:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "observed-fact",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "static model snapshot"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The margin/EPS/valuation bridge uses only the frozen reported FY26 base facts and FY27 levers currently captured, plus the explicit Simple assumptions."
      ],
      limitations: [
        "The bridge is a static modeled FY27 projection and does not establish an earnings forecast or a price target."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later owner run replaces the current reported base and FY27 levers."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function msftOutput(input, summary) {
    var scenarioValues = { summary: summary };
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: { state: "owner-evidence-relative", reason: "The bridge is calibrated to the frozen reported FY26 base and the modeled FY27 levers currently captured." },
      provenance: { classes: ["observed-fact", "user-assumption", "model-estimate"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: "bounded",
        rangeOrBand: "FY27 OM " + (summary.margin.om27 == null ? "—" : summary.margin.om27) + " / EPS " + (summary.eps.eps27 == null ? "—" : summary.eps.eps27),
        reason: "The FY27 operating margin, EPS, and implied valuation all derive from the exact frozen owner bridge facts through the single-source msftAnnualBridge."
      },
      assumptions: [
        "Depreciation growth, price/mix, FX, memory cost, capex phase, the Q4 earnings anchor, and the valuation multiple are explicit user assumptions applied over the frozen owner bridge."
      ],
      limitations: [
        "The bridge is a static modeled FY27 projection and does not establish an earnings forecast or a price target."
      ],
      invalidationConditions: [
        "The frozen owner snapshot changes or a later owner run replaces the current reported base and FY27 levers."
      ],
      flatRegionProofs: []
    };
  }

  function createMsftMarginEpsAdapter(api, definition, ownerByIdentity) {
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
        if (!ownerState || typeof ownerState !== "object" || !ownerState.bridge || typeof ownerState.bridge !== "object") {
          return { ok: false, error: { reason: "msft margin/EPS owner state (bridge base) required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildMsftEvidence(api, frozen);
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
        var summary = computeMsftMarginEpsSummary(ownerState, paramMap(input));
        return { ok: true, value: msftOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = computeMsftMarginEpsSummary(ownerState, baselineValues);
        var currentSummary = computeMsftMarginEpsSummary(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (parameterId === "seed") return;
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = MSFT_OUTPUT_PATHS[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, msftSummaryPath(baselineSummary, path)) !== fingerprintOf(api, msftSummaryPath(currentSummary, path));
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
            valueText: summary.eps.eps27 == null ? "EPS unavailable" : ("FY27 EPS " + summary.eps.eps27),
            numericValue: summary.eps.eps27,
            unit: "usd-eps",
            summary: "FY27 operating margin " + (summary.margin.om27 == null ? "—" : summary.margin.om27) +
              ", EPS " + (summary.eps.eps27 == null ? "—" : summary.eps.eps27) +
              ", implied price " + (summary.valuation.impliedPrice == null ? "—" : summary.valuation.impliedPrice) +
              " at a " + summary.valuationMultiple + "x multiple under the " + summary.earningsAnchor +
              " anchor and " + summary.capexPhase + " capex phase.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  /* Factory: returns the fundamental Simple adapters implemented at genuine owner-parity, keyed by
     their exact declared adapter ID. Tools whose owner seam is not yet extracted are absent so the
     shared runtime renders the explicit unavailable state for them. */
  function createFundamentalModelsAdapters(api, definitions, deps) {
    if (!api || typeof api.fingerprint !== "function" || typeof api.normalizeSimpleInput !== "function") {
      throw new Error("RLFUNDAMENTALS_REQUIRES_RLEXPERIENCE_API");
    }
    var byToolId = Object.create(null);
    (definitions || []).forEach(function (definition) { byToolId[definition.toolId] = definition; });
    var adapters = Object.create(null);
    var ownerByIdentity = new Map();
    if (byToolId["ai-capex-strategy-lab"]) {
      var aiCapexDefinition = byToolId["ai-capex-strategy-lab"];
      adapters[aiCapexDefinition.adapterId] = createAiCapexPortfolioAdapter(api, aiCapexDefinition, ownerByIdentity);
    }
    if (byToolId["company-fundamentals-lab"]) {
      var companyDefinition = byToolId["company-fundamentals-lab"];
      adapters[companyDefinition.adapterId] = createCompanyScenarioBridgeAdapter(api, companyDefinition, ownerByIdentity);
    }
    if (byToolId["msft-july-print-model"]) {
      var msftDefinition = byToolId["msft-july-print-model"];
      adapters[msftDefinition.adapterId] = createMsftMarginEpsAdapter(api, msftDefinition, ownerByIdentity);
    }
    return adapters;
  }

  /* Register every implemented fundamental adapter with a live shared runtime. Returns the
     per-adapter registration result so the caller can surface honest registration failures. */
  function registerFundamentalModelsAdapters(runtime, api, definitions, deps) {
    var adapters = createFundamentalModelsAdapters(api, definitions, deps);
    var results = Object.create(null);
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    contractVersion: "fundamental-models-adapters/v1",
    module: "rlexperience-adapters/fundamental-models.js",
    supportedAdapterIds: ["simple-adapter/ai-capex-portfolio/v1", "simple-adapter/company-scenario-bridge/v1", "simple-adapter/msft-margin-eps/v1"],
    erf: erf,
    normCdf: normCdf,
    invNorm: invNorm,
    bandStats: bandStats,
    cvarOf: cvarOf,
    tierMultiplier: tierMultiplier,
    horizonTarget: horizonTarget,
    objectiveWeights: objectiveWeights,
    portfolioMuSd: portfolioMuSd,
    seededBandSample: seededBandSample,
    computeAiCapexPortfolio: computeAiCapexPortfolio,
    computeAiCapexSummary: computeAiCapexSummary,
    companyReportedBase: companyReportedBase,
    projectCompanyScenario: projectCompanyScenario,
    companyScenarioLineage: companyScenarioLineage,
    companyGapLedger: companyGapLedger,
    computeCompanyScenarioSummary: computeCompanyScenarioSummary,
    msftAnnualBridge: msftAnnualBridge,
    computeMsftBridgeInputs: computeMsftBridgeInputs,
    computeMsftMarginEpsSummary: computeMsftMarginEpsSummary,
    createFundamentalModelsAdapters: createFundamentalModelsAdapters,
    registerFundamentalModelsAdapters: registerFundamentalModelsAdapters
  };
});
