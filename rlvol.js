/* ═══════════ RLVOL — conditional-volatility forecast + vol-targeting sizing ═══════════
   The single pure foundation (capability RLVOL) for the Volatility Regime and
   Vol-Targeting Sizing Lab and for Market Brief. Browser/Node-safe UMD with NO
   DOM, storage, network, timer, or ambient-clock code. Every public compute
   entry point takes an explicit ISO `decisionTime`; identical complete inputs
   produce canonically identical outputs and one deterministic `decisionId` in
   browser and Node. The module is deeply frozen.

   Contract owner: specs/011-volatility-regime-and-sizing-lab/design.md
   Consumes the EXISTING rldata.js bare-row daily-bar path and the EXISTING
   versioned putToolRead branch; rldata.js is left an unchanged read-only canary.

   The model forecasts MAGNITUDE ONLY — it carries zero directional information,
   never generates an entry, and its sizing multiplier is conditional and capped.
   Educational research only — not investment advice. */
(function (factory) {
    "use strict";

    var api = Object.freeze(factory());
    if (typeof module === "object" && module && module.exports) {
        module.exports = api;
        return;
    }
    if (typeof globalThis === "undefined") {
        throw new Error("RLVOL_BROWSER_GLOBAL_UNAVAILABLE");
    }
    globalThis.RLVOL = api;
})(function () {
    "use strict";

    var ANNUALIZATION = 252;
    var SQRT_ANNUALIZATION = Math.sqrt(ANNUALIZATION);
    var PERSISTENCE_DIVERGENCE_THRESHOLD = 0.1;

    var VOL_KINDS = ["forecast", "realized"];
    var ESTIMATORS = ["ewma", "garch11", "realized-rolling"];
    var AVAILABILITIES = ["loading", "fresh", "stale", "unavailable"];
    var QUALITIES = ["observed", "derived", "closed-form", "fitted", "user-assumption"];
    var UNAVAILABLE_REASONS = [
        "INSUFFICIENT_HISTORY", "NONFINITE", "NO_COMMON_DATES",
        "FIT_NONCONVERGENT", "MANAGED_SUPPRESSED", "SOURCE_ERROR",
        "STALE_BEYOND_POLICY"
    ];
    var COHORTS = ["equity-index", "single-name", "crypto", "commodity", "fx", "rate"];
    var MANAGEMENTS = ["free-float", "managed-reference"];
    var HISTORY_RANGES = ["5y", "10y", "max"];

    /* ── canonicalization + deterministic identity (parity/change key, not crypto) ── */

    function isPlainObject(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) return false;
        var prototype = Object.getPrototypeOf(value);
        return prototype === Object.prototype || prototype === null;
    }

    function canonicalize(value) {
        var active = [];
        function encode(current) {
            if (current === null) return "null";
            if (typeof current === "string" || typeof current === "boolean") {
                return JSON.stringify(current);
            }
            if (typeof current === "number") {
                if (!Number.isFinite(current)) throw new Error("RLVOL_NONFINITE_CANONICAL_VALUE");
                return JSON.stringify(current);
            }
            if (Array.isArray(current)) {
                if (active.indexOf(current) !== -1) throw new Error("RLVOL_CYCLIC_CANONICAL_VALUE");
                active.push(current);
                var items = current.map(encode);
                active.pop();
                return "[" + items.join(",") + "]";
            }
            if (isPlainObject(current)) {
                if (active.indexOf(current) !== -1) throw new Error("RLVOL_CYCLIC_CANONICAL_VALUE");
                active.push(current);
                var fields = Object.keys(current).sort().map(function (key) {
                    if (typeof current[key] === "undefined") {
                        throw new Error("RLVOL_UNDEFINED_CANONICAL_VALUE");
                    }
                    return JSON.stringify(key) + ":" + encode(current[key]);
                });
                active.pop();
                return "{" + fields.join(",") + "}";
            }
            throw new Error("RLVOL_UNSUPPORTED_CANONICAL_VALUE");
        }
        return encode(value);
    }

    function decisionId(value) {
        var bytes = canonicalize(value);
        var hash = 0x811c9dc5;
        for (var index = 0; index < bytes.length; index += 1) {
            hash ^= bytes.charCodeAt(index);
            hash = Math.imul(hash, 0x01000193);
        }
        return "vold-v1-" + (hash >>> 0).toString(16).padStart(8, "0");
    }

    function deepFreeze(value) {
        if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
        Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
        return Object.freeze(value);
    }

    /* ── small numeric helpers ── */

    function sum(values) {
        return values.reduce(function (total, value) { return total + value; }, 0);
    }

    function mean(values) {
        return values.length ? sum(values) / values.length : 0;
    }

    function sampleVariance(values) {
        if (values.length < 2) return 0;
        var average = mean(values);
        var acc = sum(values.map(function (value) { return (value - average) * (value - average); }));
        return acc / (values.length - 1);
    }

    function contains(values, value) {
        return Array.isArray(values) && values.indexOf(value) !== -1;
    }

    function schemaError(code, path, message) {
        var error = new Error(message || code);
        error.code = code;
        error.path = path || "$";
        return error;
    }

    function requireIsoInstant(value, code) {
        if (typeof value !== "string") throw new Error(code || "RLVOL_DECISION_TIME_INVALID");
        var epoch = Date.parse(value);
        if (!Number.isFinite(epoch) || new Date(epoch).toISOString() !== value) {
            throw new Error(code || "RLVOL_DECISION_TIME_INVALID");
        }
        return epoch;
    }

    function isIsoDate(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !Number.isNaN(Date.parse(value + "T00:00:00.000Z"));
    }

    /* ── log returns (finite positive-close guards, deterministic invalid-row drop) ── */

    function logReturns(closes) {
        if (!Array.isArray(closes)) throw schemaError("RLVOL_SCHEMA_INVALID", "closes", "array of closes is required");
        var out = [];
        for (var index = 1; index < closes.length; index += 1) {
            var prev = closes[index - 1];
            var current = closes[index];
            if (Number.isFinite(prev) && prev > 0 && Number.isFinite(current) && current > 0) {
                out.push(Math.log(current / prev));
            }
        }
        return out;
    }

    /* ── EWMA / RiskMetrics conditional variance (the DEFAULT estimator) ── */

    function ewmaVar(returns, lambda, seedWindow) {
        if (!Array.isArray(returns)) throw schemaError("RLVOL_SCHEMA_INVALID", "returns", "array of returns is required");
        if (!Number.isFinite(lambda) || lambda <= 0 || lambda >= 1) throw schemaError("RLVOL_SCHEMA_INVALID", "lambda", "lambda must be in (0,1)");
        if (!Number.isInteger(seedWindow) || seedWindow < 2) throw schemaError("RLVOL_SCHEMA_INVALID", "seedWindow", "seedWindow must be an integer >= 2");
        if (returns.length < seedWindow) throw schemaError("RLVOL_SCHEMA_INVALID", "returns", "returns shorter than seedWindow");
        var variance = sampleVariance(returns.slice(0, seedWindow));
        if (variance <= 0) variance = mean(returns.slice(0, seedWindow).map(function (value) { return value * value; }));
        var path = [variance];
        for (var index = seedWindow; index < returns.length; index += 1) {
            variance = lambda * variance + (1 - lambda) * returns[index - 1] * returns[index - 1];
            path.push(variance);
        }
        var last = returns[returns.length - 1];
        var oneStepAhead = lambda * variance + (1 - lambda) * last * last;
        return { path: path, oneStepAhead: oneStepAhead };
    }

    function ewmaVol(returns, lambda, seedWindow) {
        return Math.sqrt(ewmaVar(returns, lambda, seedWindow).oneStepAhead);
    }

    /* ── optional GARCH(1,1) LIGHTWEIGHT bounded optimizer (explicitly NOT MLE) ──
       Variance-targeting grid search minimizing the Gaussian negative log-likelihood
       under an enforced stationarity guard. A capped-iteration, no-dependency,
       single-file heuristic — never institutional maximum-likelihood estimation. */

    function garchNegLogLikelihood(returns, omega, alpha, beta, seedVar) {
        var variance = seedVar;
        var nll = 0;
        for (var index = 0; index < returns.length; index += 1) {
            if (variance <= 0) return Infinity;
            var shock = returns[index];
            nll += Math.log(variance) + (shock * shock) / variance;
            variance = omega + alpha * shock * shock + beta * variance;
        }
        return nll;
    }

    function garch11Fit(returns, opts) {
        var options = opts || {};
        var maxIter = Number.isFinite(options.maxIter) ? options.maxIter : 200;
        var minOmega = Number.isFinite(options.minOmega) ? options.minOmega : 1e-12;
        var maxPersistence = Number.isFinite(options.maxPersistence) ? options.maxPersistence : 0.999;
        var method = "lightweight-optimizer";
        if (!Array.isArray(returns) || returns.length < 30) {
            return Object.freeze({ ok: false, reason: "FIT_NONCONVERGENT", method: method });
        }
        if (returns.some(function (value) { return !Number.isFinite(value); })) {
            return Object.freeze({ ok: false, reason: "FIT_NONCONVERGENT", method: method });
        }
        var targetVariance = sampleVariance(returns);
        if (!(targetVariance > minOmega)) {
            return Object.freeze({ ok: false, reason: "FIT_NONCONVERGENT", method: method });
        }
        /* Search the FULL stationary grid for the unconstrained-best (alpha,beta), then
           apply the policy stationarity guard. This decouples the fit quality from the cap:
           a legitimate high-persistence series converges under a normal cap, while an
           artificially low cap correctly forces FIT_NONCONVERGENT because the data wants
           more persistence than the policy allows. */
        var STATIONARITY = 0.999;
        var alphaGrid = [];
        var value;
        for (value = 0.02; value <= 0.401; value += 0.04) alphaGrid.push(Math.round(value * 1000) / 1000);
        var betaGrid = [];
        for (value = 0.10; value <= 0.951; value += 0.05) betaGrid.push(Math.round(value * 1000) / 1000);
        var best = null;
        var iterations = 0;
        for (var a = 0; a < alphaGrid.length; a += 1) {
            for (var b = 0; b < betaGrid.length; b += 1) {
                var alpha = alphaGrid[a];
                var beta = betaGrid[b];
                var persistence = alpha + beta;
                if (persistence >= STATIONARITY) continue;
                if (iterations >= maxIter) break;
                iterations += 1;
                var omega = targetVariance * (1 - persistence);
                if (omega < minOmega) continue;
                var nll = garchNegLogLikelihood(returns, omega, alpha, beta, targetVariance);
                if (!Number.isFinite(nll)) continue;
                if (!best || nll < best.nll) {
                    best = { omega: omega, alpha: alpha, beta: beta, persistence: persistence, nll: nll };
                }
            }
            if (iterations >= maxIter) break;
        }
        if (!best) {
            return Object.freeze({ ok: false, reason: "FIT_NONCONVERGENT", method: method });
        }
        /* Policy stationarity guard: the data wants more persistence than the cap allows. */
        if (best.persistence >= maxPersistence) {
            return Object.freeze({ ok: false, reason: "FIT_NONCONVERGENT", method: method });
        }
        /* No ARCH/GARCH structure to fit (optimum collapses to the floor of both grids). */
        if (best.alpha <= alphaGrid[0] + 1e-9 && best.beta <= betaGrid[0] + 1e-9) {
            return Object.freeze({ ok: false, reason: "FIT_NONCONVERGENT", method: method });
        }
        var longRunVar = best.omega / (1 - best.persistence);
        return Object.freeze({
            ok: true,
            method: method,
            omega: best.omega,
            alpha: best.alpha,
            beta: best.beta,
            persistence: best.persistence,
            longRunVar: longRunVar,
            converged: true,
            iterations: iterations
        });
    }

    /* ── forecast term structure (flat for EWMA, geometric decay toward long-run for GARCH) ── */

    function annualizeVol(dailyVol) {
        if (!Number.isFinite(dailyVol) || dailyVol < 0) throw schemaError("RLVOL_SCHEMA_INVALID", "dailyVol", "finite non-negative daily volatility is required");
        return dailyVol * SQRT_ANNUALIZATION;
    }

    function forecastTerm(model, horizon) {
        if (!isPlainObject(model)) throw schemaError("RLVOL_SCHEMA_INVALID", "model", "model object is required");
        if (!Number.isInteger(horizon) || horizon < 1) throw schemaError("RLVOL_SCHEMA_INVALID", "horizon", "horizon must be a positive integer");
        if (!Number.isFinite(model.oneStepVar) || model.oneStepVar < 0) throw schemaError("RLVOL_SCHEMA_INVALID", "model.oneStepVar", "finite one-step variance is required");
        var points = [];
        var isGarch = model.estimator === "garch11" && Number.isFinite(model.longRunVar) &&
            Number.isFinite(model.alpha) && Number.isFinite(model.beta);
        var persistence = isGarch ? model.alpha + model.beta : null;
        for (var horizonDays = 1; horizonDays <= horizon; horizonDays += 1) {
            var variance;
            if (isGarch) {
                variance = model.longRunVar + Math.pow(persistence, horizonDays - 1) * (model.oneStepVar - model.longRunVar);
            } else {
                variance = model.oneStepVar;
            }
            if (variance < 0) variance = 0;
            points.push({ horizonDays: horizonDays, vol: annualizeVol(Math.sqrt(variance)), kind: "forecast" });
        }
        return points;
    }

    /* ── realized volatility (typed realized, never relabeled forecast) ── */

    function realizedVol(returns, window) {
        if (!Array.isArray(returns)) throw schemaError("RLVOL_SCHEMA_INVALID", "returns", "array of returns is required");
        if (!Number.isInteger(window) || window < 2) throw schemaError("RLVOL_SCHEMA_INVALID", "window", "window must be an integer >= 2");
        if (returns.length < window) throw schemaError("RLVOL_SCHEMA_INVALID", "returns", "returns shorter than window");
        var slice = returns.slice(returns.length - window);
        return annualizeVol(Math.sqrt(sampleVariance(slice)));
    }

    /* ── window-relative percentile (ALWAYS returns its trailing windowRef) ── */

    function volPercentile(currentVol, history, windowRef) {
        if (!Number.isFinite(currentVol)) throw schemaError("RLVOL_SCHEMA_INVALID", "currentVol", "finite current volatility is required");
        if (!Array.isArray(history) || history.length === 0) throw schemaError("RLVOL_SCHEMA_INVALID", "history", "non-empty history is required");
        if (!isPlainObject(windowRef) || !Number.isInteger(windowRef.observations) || windowRef.observations <= 0 ||
            !isIsoDate(windowRef.startDate) || !isIsoDate(windowRef.endDate)) {
            throw schemaError("RLVOL_SCHEMA_INVALID", "windowRef", "a percentile requires a declared trailing windowRef (observations, startDate, endDate)");
        }
        var atOrBelow = 0;
        for (var index = 0; index < history.length; index += 1) {
            if (!Number.isFinite(history[index])) throw schemaError("RLVOL_SCHEMA_INVALID", "history", "history values must be finite");
            if (history[index] <= currentVol) atOrBelow += 1;
        }
        var percentile = 100 * (atOrBelow / history.length);
        return {
            percentile: percentile,
            windowRef: { observations: windowRef.observations, startDate: windowRef.startDate, endDate: windowRef.endDate }
        };
    }

    function regimeBand(percentile, thresholds) {
        if (!Number.isFinite(percentile)) throw schemaError("RLVOL_SCHEMA_INVALID", "percentile", "finite percentile is required");
        if (!isPlainObject(thresholds) || !Number.isFinite(thresholds.calmMaxPct) ||
            !Number.isFinite(thresholds.normalMaxPct) || !Number.isFinite(thresholds.elevatedMaxPct)) {
            throw schemaError("RLVOL_SCHEMA_INVALID", "thresholds", "calm/normal/elevated thresholds are required");
        }
        if (!(thresholds.calmMaxPct < thresholds.normalMaxPct && thresholds.normalMaxPct < thresholds.elevatedMaxPct)) {
            throw schemaError("RLVOL_SCHEMA_INVALID", "thresholds", "thresholds must satisfy calm < normal < elevated");
        }
        if (percentile <= thresholds.calmMaxPct) return "calm";
        if (percentile <= thresholds.normalMaxPct) return "normal";
        if (percentile <= thresholds.elevatedMaxPct) return "elevated";
        return "storm";
    }

    /* ── persistence half-life (trading days) ── */

    function halfLife(persistence) {
        if (!Number.isFinite(persistence) || persistence <= 0 || persistence >= 1) {
            throw schemaError("RLVOL_SCHEMA_INVALID", "persistence", "persistence must be in (0,1)");
        }
        return Math.log(0.5) / Math.log(persistence);
    }

    /* ── capped-and-floored conditional sizing multiplier ── */

    function sizingMultiplier(targetVol, forecastVol, cap, floor) {
        if (!Number.isFinite(targetVol) || targetVol <= 0) throw schemaError("RLVOL_SCHEMA_INVALID", "targetVol", "positive target volatility is required");
        if (!Number.isFinite(forecastVol) || forecastVol < 0) throw schemaError("RLVOL_SCHEMA_INVALID", "forecastVol", "non-negative forecast volatility is required");
        if (!Number.isFinite(cap) || cap <= 0) throw schemaError("RLVOL_SCHEMA_INVALID", "cap", "positive cap is required");
        if (!Number.isFinite(floor) || floor <= 0) throw schemaError("RLVOL_SCHEMA_INVALID", "floor", "positive forecast-vol floor is required");
        return Math.min(cap, targetVol / Math.max(floor, forecastVol));
    }

    /* ── managed-suppression detection (peg/band/halt is a limitation, not "calm") ── */

    function detectManagedSuppression(returns, closes, policy) {
        if (!Array.isArray(returns) || !isPlainObject(policy)) return false;
        var zeroReturnFraction = Number.isFinite(policy.zeroReturnFraction) ? policy.zeroReturnFraction : 0.3;
        var minAbsDailyReturn = Number.isFinite(policy.minAbsDailyReturn) ? policy.minAbsDailyReturn : 0.0005;
        var identicalCloseRun = Number.isInteger(policy.identicalCloseRun) ? policy.identicalCloseRun : 10;
        if (returns.length === 0) return false;
        var zeros = 0;
        var maxAbs = 0;
        for (var index = 0; index < returns.length; index += 1) {
            var value = returns[index];
            if (!Number.isFinite(value)) continue;
            if (Math.abs(value) < 1e-12) zeros += 1;
            if (Math.abs(value) > maxAbs) maxAbs = Math.abs(value);
        }
        if (zeros / returns.length >= zeroReturnFraction) return true;
        if (maxAbs < minAbsDailyReturn) return true;
        if (Array.isArray(closes)) {
            var run = 1;
            for (var c = 1; c < closes.length; c += 1) {
                if (Number.isFinite(closes[c]) && Number.isFinite(closes[c - 1]) && closes[c] === closes[c - 1]) {
                    run += 1;
                    if (run >= identicalCloseRun) return true;
                } else {
                    run = 1;
                }
            }
        }
        return false;
    }

    /* ── typed VolObservationV1 discriminated union (typing is never interchanged) ── */

    function normalizeObservation(value) {
        if (!isPlainObject(value)) throw schemaError("RLVOL_SCHEMA_INVALID", "observation", "observation object is required");
        if (value.contractVersion !== "rlvol-observation/v1") throw schemaError("RLVOL_CONTRACT_VERSION", "contractVersion", "rlvol-observation/v1 is required");
        if (!contains(VOL_KINDS, value.kind)) throw schemaError("RLVOL_SCHEMA_INVALID", "kind", "kind must be forecast or realized");
        if (!contains(ESTIMATORS, value.estimator)) throw schemaError("RLVOL_SCHEMA_INVALID", "estimator", "estimator is outside the closed vocabulary");
        if (value.kind === "forecast" && !(value.estimator === "ewma" || value.estimator === "garch11")) {
            throw schemaError("RLVOL_SCHEMA_INVALID", "estimator", "a forecast uses ewma or garch11");
        }
        if (value.kind === "realized" && value.estimator !== "realized-rolling") {
            throw schemaError("RLVOL_SCHEMA_INVALID", "estimator", "a realized value uses realized-rolling");
        }
        if (!contains(AVAILABILITIES, value.availability)) throw schemaError("RLVOL_SCHEMA_INVALID", "availability", "availability is outside the closed vocabulary");
        if (value.availability === "unavailable") {
            if (!contains(UNAVAILABLE_REASONS, value.unavailableReason)) throw schemaError("RLVOL_SCHEMA_INVALID", "unavailableReason", "unavailable requires exactly one closed reason");
        } else if (typeof value.unavailableReason !== "undefined") {
            throw schemaError("RLVOL_SCHEMA_INVALID", "unavailableReason", "unavailableReason is only allowed when unavailable");
        }
        if (value.availability === "fresh" || value.availability === "stale") {
            if (!Number.isFinite(value.value)) throw schemaError("RLVOL_SCHEMA_INVALID", "value", "a fresh/stale observation requires a finite value");
        } else if (typeof value.value !== "undefined") {
            throw schemaError("RLVOL_SCHEMA_INVALID", "value", "loading/unavailable observations carry no value");
        }
        if (!contains(QUALITIES, value.quality)) throw schemaError("RLVOL_SCHEMA_INVALID", "quality", "quality is outside the closed vocabulary");
        if (value.windowRef !== null && value.windowRef !== undefined) {
            if (!isPlainObject(value.windowRef) || !Number.isInteger(value.windowRef.observations) ||
                !isIsoDate(value.windowRef.startDate) || !isIsoDate(value.windowRef.endDate)) {
                throw schemaError("RLVOL_SCHEMA_INVALID", "windowRef", "windowRef must carry observations and start/end dates");
            }
        }
        return deepFreeze(JSON.parse(JSON.stringify(value)));
    }

    /* ── universe validation (closed rlvol-universe/v1 contract) ── */

    function validationFailure(code, path, message) {
        return Object.freeze({ ok: false, errors: Object.freeze([Object.freeze({ code: code, path: path, message: message })]) });
    }

    function hasOnlyKeys(value, allowed) {
        var keys = Object.keys(value);
        for (var index = 0; index < keys.length; index += 1) {
            if (allowed.indexOf(keys[index]) === -1) return keys[index];
        }
        return null;
    }

    function validateUniverse(value) {
        try {
            if (!isPlainObject(value)) return validationFailure("RLVOL_UNIVERSE_INVALID", "$", "universe object is required");
            if (value.schemaVersion !== "rlvol-universe/v1") return validationFailure("RLVOL_CONTRACT_VERSION", "schemaVersion", "rlvol-universe/v1 is required");
            var stray = hasOnlyKeys(value, ["schemaVersion", "version", "reviewedAt", "assets", "policy"]);
            if (stray) return validationFailure("RLVOL_UNIVERSE_INVALID", stray, "unknown top-level key");
            if (typeof value.version !== "string" || !value.version) return validationFailure("RLVOL_UNIVERSE_INVALID", "version", "version string is required");
            if (!isIsoDate(value.reviewedAt)) return validationFailure("RLVOL_UNIVERSE_INVALID", "reviewedAt", "reviewedAt ISO date is required");
            if (!Array.isArray(value.assets) || value.assets.length === 0) return validationFailure("RLVOL_UNIVERSE_INVALID", "assets", "a non-empty assets array is required");

            var seen = {};
            for (var index = 0; index < value.assets.length; index += 1) {
                var asset = value.assets[index];
                var assetPath = "assets[" + index + "]";
                if (!isPlainObject(asset)) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath, "asset object is required");
                var assetStray = hasOnlyKeys(asset, ["symbol", "name", "cohort", "management", "defaultTargetVol", "regimeWindowObs", "minForecastObs", "reviewWindowHours", "limitations"]);
                if (assetStray) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + "." + assetStray, "unknown asset key");
                if (typeof asset.symbol !== "string" || !asset.symbol) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".symbol", "symbol is required");
                if (seen[asset.symbol]) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".symbol", "duplicate symbol");
                seen[asset.symbol] = true;
                if (typeof asset.name !== "string" || !asset.name) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".name", "name is required");
                if (!contains(COHORTS, asset.cohort)) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".cohort", "cohort is outside the closed vocabulary");
                if (!contains(MANAGEMENTS, asset.management)) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".management", "management is outside the closed vocabulary");
                if (!Number.isFinite(asset.defaultTargetVol) || asset.defaultTargetVol <= 0 || asset.defaultTargetVol > 2) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".defaultTargetVol", "defaultTargetVol must be a positive annualized decimal");
                if (!Number.isInteger(asset.regimeWindowObs) || asset.regimeWindowObs < 2) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".regimeWindowObs", "regimeWindowObs must be an integer >= 2");
                if (!Number.isInteger(asset.minForecastObs) || asset.minForecastObs < 2) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".minForecastObs", "minForecastObs must be an integer >= 2");
                if (!Number.isFinite(asset.reviewWindowHours) || asset.reviewWindowHours <= 0) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".reviewWindowHours", "reviewWindowHours must be positive");
                if (!Array.isArray(asset.limitations)) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".limitations", "limitations must be an array");
                if (asset.limitations.some(function (entry) { return typeof entry !== "string" || !entry; })) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".limitations", "limitations entries must be non-empty strings");
                if (asset.management === "managed-reference" && asset.limitations.length === 0) return validationFailure("RLVOL_UNIVERSE_INVALID", assetPath + ".limitations", "a managed-reference asset must carry at least one limitation");
            }

            var policyError = validatePolicy(value.policy);
            if (policyError) return policyError;

            return Object.freeze({ ok: true, value: deepFreeze(JSON.parse(JSON.stringify(value))) });
        } catch (error) {
            return validationFailure("RLVOL_UNIVERSE_INVALID", "$", error && error.message ? error.message : "universe validation failed");
        }
    }

    function validatePolicy(policy) {
        if (!isPlainObject(policy)) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy", "policy object is required");
        var stray = hasOnlyKeys(policy, ["ewma", "garch", "forecast", "regime", "sizing", "managedSuppression", "history"]);
        if (stray) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy." + stray, "unknown policy key");
        if (!isPlainObject(policy.ewma) || !Number.isFinite(policy.ewma.lambda) || policy.ewma.lambda <= 0 || policy.ewma.lambda >= 1) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.ewma.lambda", "lambda must be in (0,1)");
        if (!Number.isInteger(policy.ewma.seedWindow) || policy.ewma.seedWindow < 2) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.ewma.seedWindow", "seedWindow must be an integer >= 2");
        if (!isPlainObject(policy.garch) || !Number.isInteger(policy.garch.maxIter) || policy.garch.maxIter < 1) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.garch.maxIter", "maxIter must be a positive integer");
        if (!Number.isFinite(policy.garch.tolerance) || policy.garch.tolerance <= 0) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.garch.tolerance", "tolerance must be positive");
        if (!Number.isFinite(policy.garch.minOmega) || policy.garch.minOmega <= 0) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.garch.minOmega", "minOmega must be positive");
        if (!Number.isFinite(policy.garch.maxPersistence) || policy.garch.maxPersistence <= 0 || policy.garch.maxPersistence >= 1) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.garch.maxPersistence", "maxPersistence must be in (0,1)");
        if (!isPlainObject(policy.forecast) || !Number.isInteger(policy.forecast.defaultHorizonDays) || policy.forecast.defaultHorizonDays < 1) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.forecast.defaultHorizonDays", "defaultHorizonDays must be a positive integer");
        if (!Number.isInteger(policy.forecast.maxHorizonDays) || policy.forecast.maxHorizonDays < policy.forecast.defaultHorizonDays) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.forecast.maxHorizonDays", "maxHorizonDays must be >= defaultHorizonDays");
        if (policy.forecast.annualization !== ANNUALIZATION) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.forecast.annualization", "annualization must be 252");
        if (!isPlainObject(policy.regime) || !Number.isFinite(policy.regime.calmMaxPct) || !Number.isFinite(policy.regime.normalMaxPct) || !Number.isFinite(policy.regime.elevatedMaxPct)) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.regime", "regime thresholds are required");
        if (!(policy.regime.calmMaxPct < policy.regime.normalMaxPct && policy.regime.normalMaxPct < policy.regime.elevatedMaxPct && policy.regime.elevatedMaxPct < 100)) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.regime", "thresholds must satisfy calm < normal < elevated < 100");
        if (!isPlainObject(policy.sizing) || !Number.isFinite(policy.sizing.cap) || policy.sizing.cap <= 0 || !Number.isFinite(policy.sizing.forecastVolFloor) || policy.sizing.forecastVolFloor <= 0) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.sizing", "sizing cap and forecastVolFloor must be positive");
        if (!isPlainObject(policy.managedSuppression) || !Number.isFinite(policy.managedSuppression.zeroReturnFraction) || !Number.isFinite(policy.managedSuppression.minAbsDailyReturn) || !Number.isInteger(policy.managedSuppression.identicalCloseRun)) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.managedSuppression", "managedSuppression heuristics are required");
        if (!isPlainObject(policy.history) || policy.history.defaultRange !== "5y" || !Array.isArray(policy.history.longRangeOptions) || !Number.isFinite(policy.history.dailyBarReviewHours)) return validationFailure("RLVOL_UNIVERSE_INVALID", "policy.history", "history contract is required");
        return null;
    }

    /* ── backtest deep-link EMISSION only (never an in-tool verdict) ── */

    function buildBacktestDeepLink(context) {
        if (!isPlainObject(context)) throw schemaError("RLVOL_SCHEMA_INVALID", "context", "deep-link context is required");
        if (typeof context.asset !== "string" || !context.asset) throw schemaError("RLVOL_SCHEMA_INVALID", "context.asset", "asset is required");
        if (!Number.isFinite(context.targetVol) || context.targetVol <= 0) throw schemaError("RLVOL_SCHEMA_INVALID", "context.targetVol", "targetVol is required");
        var estimator = context.estimator === "garch11" ? "garch11" : "ewma";
        var pct = Math.round(context.targetVol * 1000) / 10;
        return "strategy-validation-lab.html#focus=" + encodeURIComponent(context.asset) +
            "&targetVol=" + encodeURIComponent(String(pct)) +
            "&estimator=" + encodeURIComponent(estimator) +
            "&src=volatility-sizing-lab";
    }

    /* ── the one immutable decision read ── */

    function buildUnavailableObservation(kind, estimator, subject, reason, source, observedAsOf, retrievedAt, reviewWindowHours, coverage, quality, limitations) {
        return {
            contractVersion: "rlvol-observation/v1",
            observationId: [subject, kind, estimator].join(":"),
            kind: kind,
            subject: subject,
            estimator: estimator,
            unit: "annualized-decimal",
            horizon: kind === "forecast" ? { kind: "day", value: 1 } : { kind: "rolling-window", value: 0 },
            annualization: ANNUALIZATION,
            params: null,
            persistence: null,
            coverageObs: coverage,
            windowRef: null,
            source: source,
            observedAsOf: observedAsOf,
            retrievedAt: retrievedAt,
            reviewWindow: { maxAgeHours: reviewWindowHours },
            availability: "unavailable",
            unavailableReason: reason,
            quality: quality,
            limitations: limitations
        };
    }

    function buildVolDecisionRead(input) {
        if (!isPlainObject(input)) throw schemaError("RLVOL_SCHEMA_INVALID", "input", "decision input object is required");
        requireIsoInstant(input.decisionTime, "RLVOL_DECISION_TIME_INVALID");
        var decisionTime = input.decisionTime;
        var decisionMs = Date.parse(decisionTime);
        if (typeof input.configVersion !== "string" || !input.configVersion) throw schemaError("RLVOL_SCHEMA_INVALID", "configVersion", "configVersion is required");
        if (!isPlainObject(input.controls)) throw schemaError("RLVOL_SCHEMA_INVALID", "controls", "controls are required");
        if (!isPlainObject(input.asset)) throw schemaError("RLVOL_SCHEMA_INVALID", "asset", "asset metadata is required");
        if (!isPlainObject(input.policy)) throw schemaError("RLVOL_SCHEMA_INVALID", "policy", "policy is required");
        if (!isPlainObject(input.bars) || !Array.isArray(input.bars.rows)) throw schemaError("RLVOL_SCHEMA_INVALID", "bars", "bars.rows array is required");

        var controls = {
            asset: String(input.controls.asset),
            estimator: input.controls.estimator === "garch11" ? "garch11" : "ewma",
            termLengthDays: Number.isInteger(input.controls.termLengthDays) ? input.controls.termLengthDays : input.policy.forecast.defaultHorizonDays,
            targetVol: Number.isFinite(input.controls.targetVol) && input.controls.targetVol > 0 ? input.controls.targetVol : input.asset.defaultTargetVol,
            notional: Number.isFinite(input.controls.notional) && input.controls.notional > 0 ? input.controls.notional : null,
            historyRange: contains(HISTORY_RANGES, input.controls.historyRange) ? input.controls.historyRange : "5y"
        };

        var policy = input.policy;
        var asset = input.asset;
        var subject = controls.asset;
        var source = {
            id: isPlainObject(input.bars.source) && typeof input.bars.source.id === "string" ? input.bars.source.id : "unknown",
            url: isPlainObject(input.bars.source) && typeof input.bars.source.url === "string" ? input.bars.source.url : null
        };
        var observedAsOf = isIsoDate(input.bars.observedAsOf) ? input.bars.observedAsOf : null;
        var retrievedAt = input.bars.retrievedAt;
        var reviewWindowHours = Number.isFinite(asset.reviewWindowHours) ? asset.reviewWindowHours : policy.history.dailyBarReviewHours;

        var closes = input.bars.rows.map(function (row) { return isPlainObject(row) ? row.c : NaN; });
        var validCloses = closes.filter(function (value) { return Number.isFinite(value) && value > 0; });
        var returns = logReturns(closes);
        var requiredMinimum = asset.minForecastObs;
        var available = returns.length;
        var coverageObs = { used: available, requiredMinimum: requiredMinimum };
        var coverage = { required: requiredMinimum, available: available, ratio: requiredMinimum > 0 ? available / requiredMinimum : 0 };

        var limitations = [];
        if (controls.historyRange === "10y" || controls.historyRange === "max") {
            limitations.push("Extended history beyond the 5y default is best-effort (provider-limited) and no multi-decade single-path outperformance number is reproduced as evidence of edge.");
        }
        if (Array.isArray(asset.limitations)) {
            asset.limitations.forEach(function (entry) { if (typeof entry === "string" && entry) limitations.push(entry); });
        }

        var retrievedMs = (typeof retrievedAt === "string") ? Date.parse(retrievedAt) : NaN;
        var ageHours = Number.isFinite(retrievedMs) ? (decisionMs - retrievedMs) / 3.6e6 : Infinity;
        var staleBeyondPolicy = ageHours > reviewWindowHours;
        var freshUntil = Number.isFinite(retrievedMs) ? new Date(retrievedMs + reviewWindowHours * 3.6e6).toISOString() : null;

        /* NONFINITE / INSUFFICIENT_HISTORY are whole-decision unavailable states. */
        if (validCloses.length < 2 || available === 0) {
            return finalizeDecision(assembleUnavailable("NONFINITE"));
        }
        if (available < requiredMinimum) {
            return finalizeDecision(assembleUnavailable("INSUFFICIENT_HISTORY"));
        }

        function assembleUnavailable(reason) {
            var forecastObs = buildUnavailableObservation("forecast", controls.estimator, subject, reason, source, observedAsOf, retrievedAt, reviewWindowHours, coverageObs, "closed-form", limitations.slice());
            var realizedObs = buildUnavailableObservation("realized", "realized-rolling", subject, reason, source, observedAsOf, retrievedAt, reviewWindowHours, coverageObs, "derived", limitations.slice());
            return {
                state: "unavailable",
                controls: controls,
                forecast: forecastObs,
                realized: realizedObs,
                term: { state: "unavailable", estimator: controls.estimator, longRunVol: null, points: [], unavailableReason: reason },
                regime: { state: "unavailable", band: null, percentile: null, windowRef: null, managedSuppressed: false, unavailableReason: reason },
                persistence: { state: "unavailable", shockWeight: null, memoryWeight: null, persistence: null, halfLifeDays: null },
                sizing: { state: "unavailable", multiplier: null, cap: policy.sizing.cap, forecastVolFloor: policy.sizing.forecastVolFloor, workedExample: null, conditional: true, unavailableReason: reason },
                diagnostics: { estimatorResolved: controls.estimator, garchConverged: null, garchIterations: null, coverageObs: available, requiredMinimum: requiredMinimum },
                conflicts: [],
                coverage: coverage,
                asOf: null,
                freshUntil: null,
                limitations: limitations
            };
        }

        /* Estimator resolution: EWMA closed-form default; optional labeled GARCH with fallback. */
        var lambda = policy.ewma.lambda;
        var seedWindow = Math.min(policy.ewma.seedWindow, available - 1);
        if (seedWindow < 2) seedWindow = 2;
        var ewma = ewmaVar(returns, lambda, seedWindow);
        var ewmaPersistence = lambda;

        var estimatorResolved = "ewma";
        var garchConverged = null;
        var garchIterations = null;
        var quality = "closed-form";
        var params = { lambda: lambda };
        var oneStepVar = ewma.oneStepAhead;
        var longRunVar = null;
        var garchPersistence = null;
        var model = { estimator: "ewma", oneStepVar: oneStepVar, lambda: lambda, longRunVar: null };
        var conflicts = [];

        if (controls.estimator === "garch11") {
            var fit = garch11Fit(returns, policy.garch);
            garchConverged = fit.ok === true;
            if (fit.ok) {
                estimatorResolved = "garch11";
                garchIterations = fit.iterations;
                quality = "fitted";
                params = { omega: fit.omega, alpha: fit.alpha, beta: fit.beta };
                garchPersistence = fit.persistence;
                longRunVar = fit.longRunVar;
                var garchOneStep = fit.omega + fit.alpha * returns[returns.length - 1] * returns[returns.length - 1] + fit.beta * ewma.oneStepAhead;
                oneStepVar = garchOneStep;
                model = { estimator: "garch11", oneStepVar: garchOneStep, alpha: fit.alpha, beta: fit.beta, longRunVar: longRunVar };
                if (Math.abs(garchPersistence - ewmaPersistence) > PERSISTENCE_DIVERGENCE_THRESHOLD) {
                    conflicts.push({
                        code: "EWMA_GARCH_PERSISTENCE_DIVERGENCE",
                        detail: "EWMA persistence " + roundTo(ewmaPersistence, 4) + " and the GARCH lightweight-optimizer persistence " + roundTo(garchPersistence, 4) + " disagree materially; both are shown and never averaged.",
                        observationIds: [subject + ":forecast:ewma", subject + ":forecast:garch11"],
                        blocking: false
                    });
                }
            } else {
                estimatorResolved = "ewma";
                quality = "closed-form";
                limitations.push("The optional GARCH(1,1) lightweight optimizer did not converge (" + fit.reason + "); the labeled EWMA closed-form fallback is shown instead of a broken or silent GARCH value.");
            }
        }

        var forecastDailyVol = Math.sqrt(oneStepVar);
        var forecastVol = annualizeVol(forecastDailyVol);
        var persistenceValue = estimatorResolved === "garch11" ? garchPersistence : ewmaPersistence;
        var shockWeight = estimatorResolved === "garch11" ? params.alpha : (1 - lambda);
        var memoryWeight = estimatorResolved === "garch11" ? params.beta : lambda;
        var halfLifeDays = (persistenceValue > 0 && persistenceValue < 1) ? halfLife(persistenceValue) : null;
        var longRunVol = (estimatorResolved === "garch11" && Number.isFinite(longRunVar)) ? annualizeVol(Math.sqrt(longRunVar)) : null;

        var term = forecastTerm(model, controls.termLengthDays);

        /* realized volatility (typed realized, never relabeled forecast). */
        var realizedWindow = Math.max(5, Math.min(21, Math.round(requiredMinimum / 3)));
        if (realizedWindow > available) realizedWindow = available;
        var realizedAnnual = realizedVol(returns, realizedWindow);

        /* window-relative regime percentile — build the rolling realized-vol history. */
        var realizedSeries = [];
        for (var start = realizedWindow; start <= returns.length; start += 1) {
            realizedSeries.push(annualizeVol(Math.sqrt(sampleVariance(returns.slice(start - realizedWindow, start)))));
        }
        var regimeState;
        var regimeBandValue = null;
        var percentileValue = null;
        var regimeWindowRef = null;
        var managedSuppressed = detectManagedSuppression(returns, validCloses, policy.managedSuppression);
        if (realizedSeries.length >= 1) {
            var historyLength = Math.min(asset.regimeWindowObs, realizedSeries.length);
            var history = realizedSeries.slice(realizedSeries.length - historyLength);
            var startRow = input.bars.rows[Math.max(0, input.bars.rows.length - historyLength)];
            regimeWindowRef = {
                observations: history.length,
                startDate: isIsoDate(observedAsOf) && isPlainObject(startRow) ? isoDateFromRow(startRow, observedAsOf) : observedAsOf,
                endDate: observedAsOf
            };
            var current = realizedSeries[realizedSeries.length - 1];
            var percentileRead = volPercentile(current, history, regimeWindowRef);
            percentileValue = percentileRead.percentile;
            regimeBandValue = regimeBand(percentileValue, policy.regime);
            regimeState = "ready";
        } else {
            regimeState = "unavailable";
        }

        if (managedSuppressed) {
            conflicts.push({
                code: "MANAGED_VOL_SUPPRESSION",
                detail: "History indicates a peg, band, or halt regime; the low realized volatility is marked managed-suppressed, not calm, and sizing is withheld rather than presented as automatic full size.",
                observationIds: [subject + ":realized:realized-rolling"],
                blocking: false
            });
            limitations.push("Managed/pegged/halt-suppressed low volatility is a first-class limitation — it is never presented as automatically safe or full size.");
        }

        /* sizing — capped and floored, conditional, withheld under suppression / stale-beyond-policy. */
        var sizingState = "ready";
        var multiplier = sizingMultiplier(controls.targetVol, forecastVol, policy.sizing.cap, policy.sizing.forecastVolFloor);
        var workedExample = controls.notional !== null ? { notional: controls.notional, conditionalExposure: controls.notional * multiplier } : null;
        var sizingUnavailableReason;
        if (managedSuppressed) { sizingState = "unavailable"; sizingUnavailableReason = "MANAGED_SUPPRESSED"; }
        else if (staleBeyondPolicy) { sizingState = "unavailable"; sizingUnavailableReason = "STALE_BEYOND_POLICY"; }

        var forecastAvailability = staleBeyondPolicy ? "stale" : "fresh";
        var decisionState = "ready";
        if (managedSuppressed || staleBeyondPolicy) decisionState = "partial";
        if (staleBeyondPolicy) limitations.push("Cached bars exceed the review window (" + roundTo(ageHours, 1) + "h vs " + reviewWindowHours + "h); the read is explicitly stale and sizing is withheld while stale beyond policy.");

        var forecastObs = normalizeObservation({
            contractVersion: "rlvol-observation/v1",
            observationId: subject + ":forecast:" + estimatorResolved,
            kind: "forecast",
            subject: subject,
            estimator: estimatorResolved,
            value: forecastVol,
            unit: "annualized-decimal",
            horizon: { kind: "day", value: 1 },
            annualization: ANNUALIZATION,
            params: params,
            persistence: { value: persistenceValue, halfLifeDays: halfLifeDays },
            coverageObs: coverageObs,
            windowRef: null,
            source: source,
            observedAsOf: observedAsOf,
            retrievedAt: retrievedAt,
            reviewWindow: { maxAgeHours: reviewWindowHours },
            availability: forecastAvailability,
            quality: quality,
            limitations: limitations.slice()
        });

        var realizedObs = normalizeObservation({
            contractVersion: "rlvol-observation/v1",
            observationId: subject + ":realized:realized-rolling",
            kind: "realized",
            subject: subject,
            estimator: "realized-rolling",
            value: realizedAnnual,
            unit: "annualized-decimal",
            horizon: { kind: "rolling-window", value: realizedWindow },
            annualization: ANNUALIZATION,
            params: null,
            persistence: null,
            coverageObs: coverageObs,
            windowRef: null,
            source: source,
            observedAsOf: observedAsOf,
            retrievedAt: retrievedAt,
            reviewWindow: { maxAgeHours: reviewWindowHours },
            availability: forecastAvailability,
            quality: "derived",
            limitations: managedSuppressed ? ["Managed-suppressed low realized volatility is a limitation, not calm."] : []
        });

        var decision = {
            state: decisionState,
            controls: controls,
            forecast: forecastObs,
            realized: realizedObs,
            term: {
                state: "ready",
                estimator: estimatorResolved,
                longRunVol: longRunVol,
                points: term,
                unavailableReason: undefined
            },
            regime: {
                state: regimeState,
                band: regimeBandValue,
                percentile: percentileValue,
                windowRef: regimeWindowRef,
                managedSuppressed: managedSuppressed,
                unavailableReason: regimeState === "unavailable" ? "INSUFFICIENT_HISTORY" : undefined
            },
            persistence: {
                state: "ready",
                shockWeight: shockWeight,
                memoryWeight: memoryWeight,
                persistence: persistenceValue,
                halfLifeDays: halfLifeDays
            },
            sizing: {
                state: sizingState,
                multiplier: sizingState === "ready" ? multiplier : null,
                cap: policy.sizing.cap,
                forecastVolFloor: policy.sizing.forecastVolFloor,
                workedExample: sizingState === "ready" ? workedExample : null,
                conditional: true,
                unavailableReason: sizingUnavailableReason
            },
            diagnostics: {
                estimatorResolved: estimatorResolved,
                garchConverged: garchConverged,
                garchIterations: garchIterations,
                coverageObs: available,
                requiredMinimum: requiredMinimum
            },
            conflicts: conflicts,
            coverage: coverage,
            asOf: observedAsOf,
            freshUntil: staleBeyondPolicy ? null : freshUntil,
            limitations: limitations
        };
        return finalizeDecision(decision);

        function finalizeDecision(core) {
            /* strip undefined so canonicalization is stable, then stamp identity. */
            var normalized = JSON.parse(JSON.stringify(core));
            var full = {
                contractVersion: "rlvol-decision-read/v1",
                decisionId: null,
                configVersion: input.configVersion,
                computedAt: decisionTime,
                controls: normalized.controls,
                state: normalized.state,
                forecast: normalized.forecast,
                realized: normalized.realized,
                term: normalized.term,
                regime: normalized.regime,
                persistence: normalized.persistence,
                sizing: normalized.sizing,
                diagnostics: normalized.diagnostics,
                conflicts: normalized.conflicts,
                coverage: normalized.coverage,
                asOf: normalized.asOf,
                freshUntil: normalized.freshUntil,
                limitations: normalized.limitations,
                educationalOnly: true
            };
            var identityBasis = JSON.parse(JSON.stringify(full));
            delete identityBasis.decisionId;
            full.decisionId = decisionId(identityBasis);
            return deepFreeze(full);
        }
    }

    function isoDateFromRow(row, fallbackDate) {
        if (isPlainObject(row) && Number.isFinite(row.t)) {
            var iso = new Date(row.t).toISOString().slice(0, 10);
            if (isIsoDate(iso)) return iso;
        }
        return fallbackDate;
    }

    function roundTo(value, digits) {
        var factor = Math.pow(10, digits);
        return Math.round(value * factor) / factor;
    }

    /* ── owner-read projection (summary only; no raw bars, no restricted payload) ── */

    function projectVolToolRead(decision) {
        if (!isPlainObject(decision) || decision.contractVersion !== "rlvol-decision-read/v1") {
            throw schemaError("RLVOL_CONTRACT_VERSION", "decision", "an rlvol-decision-read/v1 decision is required");
        }
        var ready = decision.state !== "unavailable";
        var forecast = decision.forecast;
        var realized = decision.realized;
        var availability;
        if (decision.state === "unavailable") availability = "unavailable";
        else if (forecast.availability === "stale") availability = "stale";
        else availability = "current";

        var regimeBandValue = decision.regime.band;
        var percentile = decision.regime.percentile;
        var regimeWindowObs = decision.regime.windowRef ? decision.regime.windowRef.observations : null;
        var multiplier = decision.sizing.multiplier;

        var readParts = [decision.controls.asset + " conditional vol"];
        if (ready && regimeBandValue) {
            readParts.push("regime " + regimeBandValue + " (" + Math.round(percentile) + "th pct / " + regimeWindowObs + " obs)");
        } else {
            readParts.push("unavailable (" + (decision.forecast.unavailableReason || "INSUFFICIENT_HISTORY") + ")");
        }
        if (ready && decision.regime.managedSuppressed) readParts.push("managed-suppressed");
        if (ready && multiplier !== null) readParts.push("throttle x" + roundTo(multiplier, 2));
        else if (ready && decision.sizing.state === "unavailable") readParts.push("sizing withheld (" + decision.sizing.unavailableReason + ")");
        var read = readParts.join("; ");

        var metrics = {
            contractVersion: "rlvol-tool-read/v1",
            decisionId: decision.decisionId,
            asset: decision.controls.asset,
            estimatorResolved: decision.diagnostics.estimatorResolved,
            forecastVol: ready && Number.isFinite(forecast.value) ? forecast.value : null,
            realizedVol: ready && Number.isFinite(realized.value) ? realized.value : null,
            regimeBand: ready ? regimeBandValue : null,
            regimePercentile: ready ? percentile : null,
            regimeWindowObs: ready ? regimeWindowObs : null,
            managedSuppressed: decision.regime.managedSuppressed,
            persistence: ready ? decision.persistence.persistence : null,
            halfLifeDays: ready ? decision.persistence.halfLifeDays : null,
            sizingMultiplier: ready ? multiplier : null,
            sizingCap: decision.sizing.cap,
            sizingFloor: decision.sizing.forecastVolFloor,
            coverage: { required: decision.coverage.required, available: decision.coverage.available, ratio: decision.coverage.ratio },
            conflicts: decision.conflicts.map(function (conflict) { return { code: conflict.code, blocking: conflict.blocking }; }),
            educationalOnly: true
        };

        var ownerRead = {
            contractVersion: "rl-tool-read/v1",
            id: "volatility-sizing-lab",
            availability: availability,
            asOf: availability === "unavailable" ? null : decision.asOf,
            read: read,
            metrics: metrics,
            deepLink: "volatility-sizing-lab.html",
            computedAt: decision.computedAt,
            freshUntil: availability === "unavailable" ? null : decision.freshUntil
        };
        return deepFreeze(ownerRead);
    }

    return {
        validateUniverse: validateUniverse,
        logReturns: logReturns,
        ewmaVar: ewmaVar,
        ewmaVol: ewmaVol,
        garch11Fit: garch11Fit,
        forecastTerm: forecastTerm,
        annualizeVol: annualizeVol,
        realizedVol: realizedVol,
        volPercentile: volPercentile,
        regimeBand: regimeBand,
        halfLife: halfLife,
        sizingMultiplier: sizingMultiplier,
        detectManagedSuppression: detectManagedSuppression,
        normalizeObservation: normalizeObservation,
        buildVolDecisionRead: buildVolDecisionRead,
        buildBacktestDeepLink: buildBacktestDeepLink,
        projectVolToolRead: projectVolToolRead,
        canonicalize: canonicalize,
        decisionId: decisionId
    };
});
