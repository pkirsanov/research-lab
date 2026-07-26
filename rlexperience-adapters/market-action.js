/*
 * rlexperience-adapters/market-action.js
 * ------------------------------------------------------------------------
 * Feature 012 Scope 07 — Market Action Center in-Brief triage Simple adapter.
 *
 * Owner seam = the Market Brief's own window / action-gating helpers. These pure
 * §6c/action-feed primitives (normalizeRecommendation, nextSessionActions,
 * actionableAttention, nearTermEvents, capConfidence, consecutiveRun,
 * isPersistentSignal) used to live inline in rlbrief.js. They are extracted here
 * as the SINGLE SOURCE: rlbrief.js now delegates every one of them to
 * RLMARKETACTION.* (so the rendered Brief and the Simple triage share ONE
 * definition — owner-parity), and the market-action-triage/v1 Simple adapter
 * composes the same primitives into a bounded action / no-action triage.
 *
 * PARITY-CRITICAL: the extraction is behaviour-preserving. Every primitive is
 * byte-for-byte the rlbrief.js body it replaced, with ONE deterministic
 * refinement: nearTermEvents no longer falls back to the wall clock on an
 * unparseable asOf (it returns no near-term catalysts). The frozen owner window
 * (and the live Brief payload) always supply a valid asOf, so that fallback was
 * dead code for every real input; removing it keeps the triage deterministic
 * (no Date.now, no randomness) and preserves the Brief's rendered/payload
 * behaviour for every real input. The market-brief.payload.json and its
 * executable payload contract are untouched.
 *
 * The Center triage is INTERNAL: it is selected by registry metadata (the
 * market-brief tool owns simple-model/market-action-triage/v1) and renders ONLY
 * inside Brief. The market-brief tool exposes the market-action-center view-set
 * (brief / portfolio / red-alert / journey) with NO top-level Simple and NO
 * Power view, so this adapter can never surface a fifth top-level Simple tab.
 *
 * The adapter is PURE COMPUTE over an already-captured, frozen owner Brief-window
 * snapshot. It NEVER fetches, providerFetches, reads credentials, calls an LLM, a
 * publisher, or a private store; it never mutates owner state; it never imports
 * another domain adapter module; and it uses no clock or randomness. Evidence
 * limitations are preserved: gated-out candidates remain honest disclosures,
 * never dropped and never promoted to actions.
 *
 * Ships as a UMD dual module: Node (module.exports) for tests, and browser
 * global RLMARKETACTION for the owning Brief page (market-brief.html).
 */
(function (factory) {
  "use strict";
  var api = Object.freeze(factory());
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
    return;
  }
  if (typeof globalThis === "undefined") {
    throw new Error("RLMARKETACTION_BROWSER_GLOBAL_UNAVAILABLE");
  }
  globalThis.RLMARKETACTION = api;
})(function () {
  "use strict";

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function roundTo(value, places) {
    if (!isFiniteNumber(value)) return value;
    var factor = Math.pow(10, places);
    return Math.round(value * factor) / factor;
  }

  /* ═══════════ owner window / action-gating primitives (single source; delegated from rlbrief.js) ═══════════
     These are the exact §6c / action-feed helpers the Market Brief renders with. rlbrief.js delegates each of
     them to RLMARKETACTION.*, and the triage adapter below composes the same functions. Keep them as `function`
     declarations so scripts/selftest.mjs can extract + test them, and keep their bodies byte-identical to the
     rlbrief.js originals (except nearTermEvents' deterministic invalid-asOf refinement noted in the header). */

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
     days by default). Invalid/far-out dates remain in config/payload but not the cockpit.
     Deterministic: an unparseable asOf yields no near-term catalysts (the frozen owner
     window and the live Brief payload always supply a valid asOf). */
  function nearTermEvents(events, asOf, maxCalendarDays) {
    var base = Date.parse(asOf || ""), span = (isFinite(maxCalendarDays) ? maxCalendarDays : 14) * 864e5;
    if (!isFinite(base)) return [];
    return (events || []).filter(function (event) {
      var time = Date.parse(event && event.when); return isFinite(time) && time >= base - 864e5 && time <= base + span;
    }).sort(function (a, b) { return Date.parse(a.when) - Date.parse(b.when); });
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

  /* ═══════════ Simple adapter contract wiring (framework infra, not a formula) ═══════════ */

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

  /* affectsOutputPaths read directly from the definition — cannot drift from simple-models.json. */
  function outputPathsFromDefinition(definition) {
    var map = Object.create(null);
    definition.parameterDefinitions.forEach(function (parameter) {
      map[parameter.parameterId] = Array.isArray(parameter.affectsOutputPaths) ? parameter.affectsOutputPaths.slice() : [];
    });
    return map;
  }

  /* ═══════════ market-action-triage Simple model (owner seam = the seven primitives above) ═══════════
     Recompute a bounded action / no-action triage for ONE frozen owner Brief window under a steerable window,
     decision horizon, evidence threshold, catalyst horizon, and risk posture. Every gate reuses a single-sourced
     owner window/action-gating primitive; the Simple layer only sets the explicit thresholds. Each declared
     parameter drives exactly its declared summary path:
        window            -> summary.window     (which scheduled owner evidence slice is triaged)
        horizon           -> summary.horizon    (session count + §6c horizon class + capped action confidence)
        evidence-threshold-> summary.actionState (the confidence floor the gate must clear)
        catalyst-horizon  -> summary.catalysts  (how far out forthcoming catalysts participate)
        risk-posture      -> summary.actionState (posture-adjusted floor: defensive raises it, opportunistic lowers)
     Excluded candidates are preserved as honest disclosures, never dropped and never promoted to actions. */

  var TACTICAL_CONFIDENCE_CAP = 55;
  var MAX_TRIAGE_ACTIONS = 5;
  var PERSISTENCE_MIN_RUN = 2;

  function horizonClassForSessions(sessions) {
    return sessions <= 1 ? "tactical" : sessions <= 5 ? "swing" : "structural";
  }

  /* Risk posture adjusts the effective confidence floor: defensive demands MORE evidence before an action,
     opportunistic accepts LESS, balanced is neutral. */
  function postureFloorDelta(posture) {
    if (posture === "defensive") return 10;
    if (posture === "opportunistic") return -10;
    return 0;
  }

  function clampFloor(value) {
    if (!isFiniteNumber(value)) return 0;
    return Math.min(100, Math.max(0, value));
  }

  function selectWindow(ownerState, windowId) {
    var windows = ownerState && ownerState.windows;
    if (!windows || typeof windows !== "object") return null;
    return windows[windowId] || null;
  }

  function seriesForRecommendation(win, rec) {
    var series = win && win.seriesByKey;
    if (!series || typeof series !== "object") return [];
    var key = rec.key || rec.subject || rec.instrument;
    return Array.isArray(series[key]) ? series[key] : [];
  }

  /* Pure market-action triage over the frozen owner Brief window. No fetch, clock, or randomness. */
  function triage(ownerState, params) {
    var windowId = params.window;
    var horizonSessions = Math.max(1, Math.round(params.horizon));
    var catalystDays = Math.max(1, Math.round(params["catalyst-horizon"]));
    var posture = params["risk-posture"];
    var horizonClass = horizonClassForSessions(horizonSessions);
    var win = selectWindow(ownerState, windowId);

    if (!win) {
      return {
        contractVersion: "market-action-triage-summary/v1",
        window: { windowId: windowId, label: null, asOf: null, candidateCount: 0, attentionCount: 0, state: "unavailable" },
        horizon: { sessions: horizonSessions, horizonClass: horizonClass, cappedActionConfidence: null },
        actionState: { state: "no-action", gatedActionCount: 0, persistentActionCount: 0, actionableAttentionCount: 0, effectiveFloor: null, posture: posture, reason: "The selected Brief window has no frozen owner evidence." },
        catalysts: { horizonDays: catalystDays, count: 0, nearest: null, disclosures: [] }
      };
    }

    var recs = Array.isArray(win.recommendations) ? win.recommendations : [];
    var attention = Array.isArray(win.attention) ? win.attention : [];
    var events = Array.isArray(win.events) ? win.events : [];
    var asOf = win.asOf || ownerState.asOf || null;

    // evidence threshold (0..1 score) -> confidence floor (0..100), then posture-adjusted. (summary.actionState)
    var thresholdFloor = clampFloor((isFiniteNumber(params["evidence-threshold"]) ? params["evidence-threshold"] : 0) * 100);
    var effectiveFloor = clampFloor(thresholdFloor + postureFloorDelta(posture));

    // horizon class + §6c anti-reactivity cap on the strongest candidate confidence. (summary.horizon)
    var topConfidence = recs.reduce(function (acc, r) {
      return (isFinite(r.confidence) && r.confidence > acc) ? r.confidence : acc;
    }, 0);
    var cappedActionConfidence = capConfidence(topConfidence, horizonClass, TACTICAL_CONFIDENCE_CAP);

    // action gate: gated next-session actions above the effective floor that ALSO carry a persistent momentum
    // signal in their own frozen series — both gates are single-sourced owner primitives. (summary.actionState)
    var gated = nextSessionActions(recs, MAX_TRIAGE_ACTIONS, effectiveFloor);
    var persistentGated = gated.filter(function (a) {
      return isPersistentSignal(seriesForRecommendation(win, a), PERSISTENCE_MIN_RUN);
    });
    var actionAttention = actionableAttention(attention, effectiveFloor);
    var actionState = persistentGated.length >= 1 ? "action" : "no-action";

    // catalysts within the steered catalyst horizon. (summary.catalysts)
    var catalysts = nearTermEvents(events, asOf, catalystDays);

    // Evidence disclosures — every candidate the FINAL action gate excluded is surfaced with its reason (watch-only,
    // missing action evidence, below the evidence threshold, or no persistent signal), never dropped, never promoted.
    var actionSubjects = Object.create(null);
    persistentGated.forEach(function (a) { actionSubjects[a.subject] = true; });
    var disclosures = recs.map(normalizeRecommendation).filter(function (r) {
      return !actionSubjects[r.subject];
    }).map(function (r) {
      var reason = r.action === "watch"
        ? "watch-only"
        : (!r.trigger || !r.invalidation || !r.structuralAnchor)
          ? "missing action evidence"
          : (isFinite(r.confidence) && r.confidence < effectiveFloor)
            ? "below evidence threshold"
            : "no persistent signal";
      return { subject: r.subject, action: r.action, confidence: isFinite(r.confidence) ? r.confidence : null, reason: reason, promoted: false };
    });

    return {
      contractVersion: "market-action-triage-summary/v1",
      window: {
        windowId: windowId,
        label: win.label || null,
        asOf: asOf,
        candidateCount: recs.length,
        attentionCount: attention.length,
        state: "ready"
      },
      horizon: {
        sessions: horizonSessions,
        horizonClass: horizonClass,
        cappedActionConfidence: roundTo(cappedActionConfidence, 4)
      },
      actionState: {
        state: actionState,
        gatedActionCount: gated.length,
        persistentActionCount: persistentGated.length,
        actionableAttentionCount: actionAttention.length,
        effectiveFloor: roundTo(effectiveFloor, 4),
        posture: posture,
        reason: actionState === "action"
          ? (persistentGated.length + " gated action(s) above the " + roundTo(effectiveFloor, 2) + " floor carry a persistent signal")
          : ("No gated action above the " + roundTo(effectiveFloor, 2) + " floor carries a persistent signal")
      },
      catalysts: {
        horizonDays: catalystDays,
        count: catalysts.length,
        nearest: catalysts.length ? { when: catalysts[0].when, event: catalysts[0].event } : null,
        disclosures: disclosures
      }
    };
  }

  function marketActionEvidenceState(ownerState) {
    var hasWindows = ownerState && ownerState.windows && typeof ownerState.windows === "object" && Object.keys(ownerState.windows).length > 0;
    var isBrief = ownerState && ownerState.toolId === "market-brief";
    return (hasWindows && isBrief) ? "ready" : "unavailable";
  }

  function buildMarketActionEvidence(api, definition, ownerState) {
    var state = marketActionEvidenceState(ownerState);
    var cutoff = String(ownerState.asOf || "unavailable");
    var evidence = {
      contractVersion: "simple-evidence-snapshot/v1",
      toolId: definition.toolId,
      state: state,
      evidenceCutoff: cutoff,
      evidenceRefs: [{
        requirementId: "owner-evidence",
        evidenceRef: "owner:" + definition.toolId + ":brief-windows:" + cutoff,
        semanticFingerprint: ownerStateFingerprint(api, ownerState),
        sourceClass: "model-estimate",
        observedAsOf: cutoff,
        retrievedOrPublishedAt: cutoff,
        freshness: "cache-current-for-render",
        dataTier: String(ownerState.source || "owner Brief windows"),
        valueState: state === "ready" ? "ready" : "unavailable"
      }],
      parameterValues: {},
      assumptions: [
        "The action / no-action triage is computed only by the shared owner window/action-gating primitives the Market Brief renders with; the Simple layer sets the explicit window, horizon, evidence threshold, catalyst horizon, and risk posture."
      ],
      limitations: [
        "Every candidate the action gate excludes stays a visible disclosure with its reason (watch-only, missing action evidence, below threshold, or no persistent signal); it is never dropped and never promoted to an action."
      ],
      invalidationConditions: [
        "The frozen owner Brief windows (recommendations, attention, momentum series, or catalysts) change."
      ],
      evidenceIdentity: null
    };
    evidence.evidenceIdentity = evidenceIdentityOf(api, evidence);
    return evidence;
  }

  function marketActionTriageOutput(input, summary) {
    var scenarioValues = { summary: summary };
    var isAction = summary.actionState.state === "action";
    return {
      contractVersion: "simple-model-output/v1",
      state: "ready",
      values: scenarioValues,
      scenarios: input.scenarios.map(function (scenario) {
        return { scenarioId: scenario.scenarioId, state: "ready", values: scenarioValues };
      }),
      calibration: {
        state: "owner-evidence-relative",
        reason: "The triage is a bounded action/no-action decision over the frozen owner Brief window using the same window/action-gating primitives the Brief renders with; excluded candidates remain disclosures."
      },
      provenance: { classes: ["model-estimate", "user-assumption"], evidenceIdentity: input.evidenceIdentity },
      uncertainty: {
        state: isAction ? "bounded" : "wide",
        rangeOrBand: isAction
          ? (summary.actionState.persistentActionCount + " persistent action(s) in the " + summary.window.windowId + " window")
          : ("No persistent action in the " + summary.window.windowId + " window (" + summary.actionState.gatedActionCount + " gated, 0 persistent)"),
        reason: "The triage is deterministic over the frozen owner window; the action decision requires a gated recommendation above the posture-adjusted floor that also carries a persistent momentum signal."
      },
      assumptions: [
        "Window, horizon, evidence threshold, catalyst horizon, and risk posture are explicit user assumptions applied to the frozen owner Brief evidence; they are not observed facts."
      ],
      limitations: [
        "Excluded candidates remain visible disclosures with their reason and are never promoted to actions."
      ],
      invalidationConditions: [
        "The frozen owner Brief windows change."
      ],
      flatRegionProofs: []
    };
  }

  function marketActionSummaryPath(summary, path) {
    if (path === "summary.window") return summary.window;
    if (path === "summary.horizon") return summary.horizon;
    if (path === "summary.actionState") return summary.actionState;
    if (path === "summary.catalysts") return summary.catalysts;
    return null;
  }

  function createMarketActionAdapter(api, definition, ownerByIdentity) {
    var outputPaths = outputPathsFromDefinition(definition);
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
        if (!ownerState || typeof ownerState !== "object" || !ownerState.windows) {
          return { ok: false, error: { reason: "market-action owner state required" } };
        }
        var frozen = deepFreeze(JSON.parse(JSON.stringify(ownerState)));
        var evidence = buildMarketActionEvidence(api, definition, frozen);
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
        var summary = triage(ownerState, paramMap(input));
        return { ok: true, value: marketActionTriageOutput(input, summary) };
      },
      compareSensitivity: function (baselineInput, currentInput, sharedRandomness) {
        var ownerState = ownerByIdentity.get(currentInput.evidenceIdentity);
        if (!ownerState) {
          return { ok: false, error: { reason: "frozen owner state is unavailable for sensitivity" } };
        }
        var baselineValues = paramMap(baselineInput);
        var currentValues = paramMap(currentInput);
        var baselineSummary = triage(ownerState, baselineValues);
        var currentSummary = triage(ownerState, currentValues);
        var effects = [];
        Object.keys(currentValues).forEach(function (parameterId) {
          if (baselineValues[parameterId] === currentValues[parameterId]) return;
          var paths = outputPaths[parameterId] || [];
          var changed = paths.some(function (path) {
            return fingerprintOf(api, marketActionSummaryPath(baselineSummary, path)) !== fingerprintOf(api, marketActionSummaryPath(currentSummary, path));
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
              reason: "The frozen owner Brief window yields an identical value on these paths for this parameter change."
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
        var st = summary.actionState;
        return {
          ok: true,
          value: {
            contractVersion: "owner-evidence-projection/v1",
            state: output.state,
            valueText: st.state === "action" ? ("ACTION — " + st.persistentActionCount + " persistent") : "NO-ACTION",
            numericValue: st.persistentActionCount,
            unit: "persistent-actions",
            summary: "The " + summary.window.windowId + " Brief window triages to " + st.state + " (" + st.gatedActionCount + " gated, " + st.persistentActionCount + " persistent above the " + st.effectiveFloor + " floor); " + summary.catalysts.count + " catalyst(s) inside " + summary.catalysts.horizonDays + " days.",
            sourceRefs: ["owner-evidence"]
          }
        };
      }
    };
  }

  var MARKET_ACTION_TRIAGE_DEFINITION_ID = "simple-model/market-action-triage/v1";

  /* Register only the internal Center triage definition; a registry without it registers nothing here. */
  function createMarketActionAdapters(api, definitions) {
    var ownerByIdentity = new Map();
    var adapters = {};
    (definitions || []).forEach(function (definition) {
      if (definition && definition.definitionId === MARKET_ACTION_TRIAGE_DEFINITION_ID) {
        adapters[definition.adapterId] = createMarketActionAdapter(api, definition, ownerByIdentity);
      }
    });
    return adapters;
  }

  function registerMarketActionAdapters(runtime, api, definitions) {
    var adapters = createMarketActionAdapters(api, definitions);
    var results = {};
    Object.keys(adapters).forEach(function (adapterId) {
      results[adapterId] = runtime.registerAdapter(adapters[adapterId]);
    });
    return results;
  }

  return {
    // single-sourced owner window/action-gating primitives (rlbrief.js delegates to these)
    normalizeRecommendation: normalizeRecommendation,
    nextSessionActions: nextSessionActions,
    actionableAttention: actionableAttention,
    nearTermEvents: nearTermEvents,
    capConfidence: capConfidence,
    consecutiveRun: consecutiveRun,
    isPersistentSignal: isPersistentSignal,
    // triage composition + Simple adapter registration
    triage: triage,
    createMarketActionAdapters: createMarketActionAdapters,
    registerMarketActionAdapters: registerMarketActionAdapters,
    supportedAdapterIds: ["simple-adapter/market-action-triage/v1"]
  };
});
